import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { GeneratedProjectPlan } from '../ai/dto/generated-plan.dto.js';

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

  async createProjectFromPlan(plan: GeneratedProjectPlan) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Project
      const project = await tx.project.create({
        data: {
          name: plan.projectName,
          description: plan.projectDescription,
          status: 'ACTIVE',
        },
      });

      const tempToRealTaskId = new Map<string, string>();
      const dependenciesToCreate: { taskId: string; dependsOnTempId: string }[] = [];

      // 2. Create Epics and Tasks
      for (const epicData of plan.epics) {
        const epic = await tx.epic.create({
          data: {
            projectId: project.id,
            title: epicData.title,
            description: epicData.description,
          },
        });

        for (const taskData of epicData.tasks) {
          const task = await tx.task.create({
            data: {
              projectId: project.id,
              epicId: epic.id,
              title: taskData.title,
              description: taskData.description,
              priority: taskData.priority,
              estimatedHours: taskData.estimatedHours,
              aiExplanation: taskData.aiExplanation,
            },
          });

          // Map tempId to real UUID
          tempToRealTaskId.set(taskData.tempId, task.id);

          // Queue dependencies for later since we need all real IDs first
          if (taskData.dependsOnTempIds && taskData.dependsOnTempIds.length > 0) {
            for (const depId of taskData.dependsOnTempIds) {
              dependenciesToCreate.push({
                taskId: task.id,
                dependsOnTempId: depId,
              });
            }
          }

          // 3. Create Subtasks
          if (taskData.subtasks && taskData.subtasks.length > 0) {
            await tx.subtask.createMany({
              data: taskData.subtasks.map((st) => ({
                taskId: task.id,
                title: st.title,
              })),
            });
          }
        }
      }

      // 4. Create Task Dependencies
      for (const dep of dependenciesToCreate) {
        const dependsOnRealId = tempToRealTaskId.get(dep.dependsOnTempId);
        if (dependsOnRealId) {
          await tx.taskDependency.create({
            data: {
              taskId: dep.taskId,
              dependsOnTaskId: dependsOnRealId,
            },
          });
        }
      }

      return project;
    });
  }
}
