import { User, Project, Epic, Task, Subtask, TaskDependency } from './types';

// Mock Users (Kept for UI login purposes until a real auth database is built)
export const mockUsers: User[] = [
  {
    id: 'user-current',
    name: 'Alex Developer',
    email: 'alex@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'user-co-dev',
    name: 'Sarah Engineer',
    email: 'sarah@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    createdAt: '2026-08-02T10:00:00Z',
  },
  {
    id: 'user-pm',
    name: 'David Product Manager',
    email: 'david@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    createdAt: '2026-08-03T10:00:00Z',
  },
];

// Mock data emptied for production/AI integration
export const mockProjects: Project[] = [];
export const mockEpics: Epic[] = [];
export const mockTasks: Task[] = [];
export const mockSubtasks: Subtask[] = [];
export const mockDependencies: TaskDependency[] = [];

// Generators definitions for requirement analyzer
export interface GenerationResult {
  project: Omit<Project, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>;
  epics: Omit<Epic, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>[];
  tasks: (Omit<Task, 'id' | 'projectId' | 'epicId' | 'createdAt' | 'updatedAt'> & { epicIndex: number })[];
  dependencies: { taskIndex: number; dependsOnTaskIndex: number }[];
}

export const promptPresets: { title: string; prompt: string; result: GenerationResult }[] = [];
