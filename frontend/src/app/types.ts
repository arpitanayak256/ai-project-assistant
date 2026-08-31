export type Role = 'OWNER' | 'MEMBER' | 'VIEWER';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  deadline?: string;
  status: string; // e.g. ACTIVE, COMPLETED, ARCHIVED
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Epic {
  id: string;
  projectId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  epicId: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedHours: number;
  dueDate?: string;
  assigneeId?: string | null;
  createdAt: string;
  updatedAt: string;
  aiExplanation?: string; // AI estimation/priority explanation
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
}

export interface AIConversation {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface ProjectHealth {
  score: number;
  completedTasks: number;
  totalTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  workloadDistribution: {
    assigneeName: string;
    taskCount: number;
    hours: number;
  }[];
  aiInsights: string[];
  aiRecommendations: string[];
}
