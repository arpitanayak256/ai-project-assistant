export interface GeneratedSubtask {
  title: string;
}

export interface GeneratedTask {
  tempId: string; // Temporary ID (e.g., "task-1") to handle task dependencies before DB saving
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedHours: number;
  subtasks: GeneratedSubtask[];
  dependsOnTempIds?: string[]; // References tempId of prerequisite tasks
  aiExplanation?: string;
}

export interface GeneratedEpic {
  title: string;
  description: string;
  tasks: GeneratedTask[];
}

export interface GeneratedProjectPlan {
  projectName: string;
  projectDescription: string;
  epics: GeneratedEpic[];
}
