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

    const generationSchema = z.object({
      projectName: z.string().describe('The name of the project'),
      projectDescription: z.string().describe('A 1-2 sentence description of the project'),
      epics: z.array(z.object({
        title: z.string().describe('The epic title'),
        description: z.string().describe('A brief description of this epic'),
        tasks: z.array(z.object({
          tempId: z.string().describe('Temporary ID (e.g., "task-1") to handle task dependencies before DB saving'),
          title: z.string().describe('The task title'),
          description: z.string().describe('Detailed task description'),
          priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).describe('Task priority'),
          estimatedHours: z.number().describe('Estimated hours to complete'),
          subtasks: z.array(z.object({
            title: z.string().describe('The subtask title')
          })).describe('Actionable subtasks for the task'),
          dependsOnTempIds: z.array(z.string()).describe('References tempId of prerequisite tasks. Empty array if none.'),
          aiExplanation: z.string().describe('Brief explanation for why this task is needed and the time estimate')
        })).describe('The actionable tasks inside this epic')
      })).describe('The high-level epics/phases of the project')
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
    
    // 5. Return the JSON output for frontend interactive preview
    this.logger.log('Project plan generated successfully. Returning to frontend for preview.');
    return result;
  }
}
