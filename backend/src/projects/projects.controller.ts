import { Controller, Get } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('full')
  async getFullProjects() {
    const projects = await this.projectsService.getAllFullProjects();
    const dependencies = await this.projectsService.getAllDependencies();
    return { projects, dependencies };
  }
}
