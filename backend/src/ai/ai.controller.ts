import { Controller, Post, Body, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service.js';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-plan')
  @UseInterceptors(AnyFilesInterceptor())
  async generatePlan(
    @Body('prompt') prompt: string,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    let pdfText = '';
    const images: string[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        if (file.mimetype === 'application/pdf') {
          pdfText += await this.aiService.extractTextFromPdf(file.buffer) + '\n';
        } else if (file.mimetype.startsWith('image/')) {
          const base64 = file.buffer.toString('base64');
          images.push(`data:${file.mimetype};base64,${base64}`);
        }
      }
    }

    return this.aiService.generateProjectPlan(prompt, pdfText, images);
  }
}
