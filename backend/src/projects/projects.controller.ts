import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import type { GeneratedProjectPlan } from '../ai/dto/generated-plan.dto.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('full')
  async getFullProjects() {
    const projects = await this.projectsService.getAllFullProjects();
    const dependencies = await this.projectsService.getAllDependencies();
    return { projects, dependencies };
  }

  @Post('import')
  async importGeneratedPlan(@Body() plan: GeneratedProjectPlan) {
    return this.projectsService.createProjectFromPlan(plan);
  }
}
