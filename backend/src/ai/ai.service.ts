import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private model: ChatOpenAI;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      const isOpenRouter = apiKey.startsWith('sk-or-');
      this.model = new ChatOpenAI({
        modelName: isOpenRouter ? 'openai/gpt-4o' : 'gpt-4o',
        temperature: 0.2,
        maxTokens: 1200, // Explicitly limit output tokens to prevent OpenRouter 402 balance errors (User balance is 1343)
        openAIApiKey: apiKey,
        configuration: isOpenRouter ? {
          baseURL: 'https://openrouter.ai/api/v1'
        } : undefined
      });
    } else {
      this.logger.warn('OPENAI_API_KEY is not set! AI features will fail.');
    }
  }

  /**
   * Extracts text from an uploaded PDF buffer
   */
  async extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      this.logger.error('Failed to parse PDF', error);
      throw new Error('Failed to parse PDF file');
    }
  }

  /**
   * Takes user prompt + file text and generates a project plan structure
   */
  async generateProjectPlan(userPrompt: string, pdfText?: string, imagesBase64?: string[]) {
    this.logger.log('Generating structured project plan...');

    if (!this.model) {
      throw new Error('AI Model is not configured. Check your API key.');
    }

    // 1. Define the specific "Blueprint" using Zod
    const generationSchema = z.object({
      project: z.object({
        name: z.string().describe('The name of the project'),
        description: z.string().describe('A 1-2 sentence description of the project'),
        status: z.enum(['ACTIVE', 'IN_PROGRESS', 'TODO']).describe('Initial project status')
      }),
      epics: z.array(z.object({
        title: z.string().describe('The epic title'),
        description: z.string().describe('A brief description of this epic')
      })).describe('The high-level epics/phases of the project'),
      tasks: z.array(z.object({
        epicIndex: z.number().describe('The index of the epic this task belongs to'),
        title: z.string().describe('The task title'),
        description: z.string().describe('Detailed task description'),
        status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).describe('Initial task status'),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).describe('Task priority'),
        estimatedHours: z.number().describe('Estimated hours to complete'),
        aiExplanation: z.string().describe('Brief explanation for why this task is needed and the time estimate')
      })).describe('The actionable tasks'),
      dependencies: z.array(z.object({
        taskIndex: z.number().describe('The index of the dependent task'),
        dependsOnTaskIndex: z.number().describe('The index of the task it depends on')
      })).describe('Task dependencies (which tasks must be done before others)')
    });

    // 2. Lock the AI into "data-entry mode" using our Blueprint
    const structuredModel = this.model.withStructuredOutput(generationSchema);

    // 3. Build the prompt with text and images
    const messages: any[] = [
      new SystemMessage(
        'You are an expert Technical Project Manager. Your job is to analyze the requirements ' +
        'and create a comprehensive project plan broken down into Epics and Tasks. ' +
        'You MUST strictly return the output in the requested JSON structure.'
      ),
    ];

    let userContent = `User Prompt: ${userPrompt}\n`;
    if (pdfText) {
      userContent += `\nPDF Content Extracted:\n${pdfText}\n`;
    }

    // If there are images, we format the message to include them
    if (imagesBase64 && imagesBase64.length > 0) {
      const contentArray: any[] = [{ type: 'text', text: userContent }];
      for (const base64 of imagesBase64) {
        contentArray.push({
          type: 'image_url',
          image_url: { url: base64 }
        });
      }
      messages.push(new HumanMessage({ content: contentArray }));
    } else {
      messages.push(new HumanMessage(userContent));
    }

    // 4. Send it to OpenAI and wait for the strictly formatted JSON
    this.logger.log('Sending request to OpenAI...');
    const result = await structuredModel.invoke(messages);
    
    // 5. Save the generated plan to the database
    this.logger.log('Saving generated plan to PostgreSQL database...');

    const newProject = await this.prisma.project.create({
      data: {
        name: result.project.name,
        description: result.project.description,
        status: result.project.status,
        ownerId: null, // Project no longer forces user creation
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      }
    });

    const epicsMap = new Map();
    for (let i = 0; i < result.epics.length; i++) {
      const e = result.epics[i];
      const epic = await this.prisma.epic.create({
        data: {
          projectId: newProject.id,
          title: e.title,
          description: e.description,
        }
      });
      epicsMap.set(i, epic.id);
    }

    const tasksMap = new Map();
    for (let i = 0; i < result.tasks.length; i++) {
      const t = result.tasks[i];
      const task = await this.prisma.task.create({
        data: {
          projectId: newProject.id,
          epicId: epicsMap.get(t.epicIndex),
          title: t.title,
          description: t.description,
          status: t.status as any,
          priority: t.priority as any,
          estimatedHours: t.estimatedHours,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          assigneeId: null, // Tasks start unassigned
          aiExplanation: t.aiExplanation,
        }
      });
      tasksMap.set(i, task.id);
    }

    for (const d of result.dependencies) {
      const taskId = tasksMap.get(d.taskIndex);
      const dependsOnTaskId = tasksMap.get(d.dependsOnTaskIndex);
      
      if (!taskId || !dependsOnTaskId) {
        this.logger.warn(`AI hallucinated dependency index: taskIndex=${d.taskIndex}, dependsOnTaskIndex=${d.dependsOnTaskIndex}. Skipping.`);
        continue;
      }

      await this.prisma.taskDependency.create({
        data: {
          taskId,
          dependsOnTaskId,
        }
      });
    }

    this.logger.log(`Project successfully saved with ID: ${newProject.id}`);

    // Return the original structured result so the frontend PlannerView can still preview it
    return result;
  }
}
