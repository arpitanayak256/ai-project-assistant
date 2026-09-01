import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async getAllFullProjects() {
    return this.prisma.project.findMany({
      include: {
        epics: true,
        tasks: true,
      },
    });
  }

  async getAllDependencies() {
    return this.prisma.taskDependency.findMany();
  }
}
