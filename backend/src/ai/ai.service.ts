import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private model: ChatOpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.model = new ChatOpenAI({
        modelName: 'gpt-4o',
        temperature: 0.2,
        openAIApiKey: apiKey,
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
    // This is a placeholder for the actual generation logic which we'll expand in Phase 2
    this.logger.log('Generating project plan...');
    
    return {
      message: 'AI Service initialized. Ready to generate projects!',
      receivedPrompt: userPrompt,
      hasPdf: !!pdfText,
      imageCount: imagesBase64 ? imagesBase64.length : 0
    };
  }
}
