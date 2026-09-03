'use client';

import { useState, useCallback } from 'react';
import { apiRequest } from '../services/api';

export interface GeneratedSubtask {
  title: string;
}

export interface GeneratedTask {
  tempId: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedHours: number;
  subtasks: GeneratedSubtask[];
  dependsOnTempIds?: string[];
}

export interface GeneratedEpic {
  title: string;
  description: string;
  tasks: GeneratedTask[];
}

export interface GeneratedProjectPlan {
  projectName: string;
  projectDescription: string;
  architectureDiagram?: string;
  databaseSchema?: { tableName: string; columns: (string | { name: string; type: string; isPrimary?: boolean; isForeign?: boolean })[] }[];
  apiEndpoints?: { method: 'GET' | 'POST' | 'PUT' | 'DELETE' | string; path: string; purpose?: string; description?: string }[];
  epics: GeneratedEpic[];
}

export function useAiPlanner() {
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedProjectPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generatePlan = useCallback(async (prompt: string, files?: File[]): Promise<GeneratedProjectPlan> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('files', file);
        });
      }

      const plan = await apiRequest<GeneratedProjectPlan>('/ai/generate-plan', {
        method: 'POST',
        body: formData,
      });

      setGeneratedPlan(plan);
      return plan;
    } catch (err: any) {
      const msg = err.message || 'Failed to generate project plan';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPlan = useCallback(() => {
    setGeneratedPlan(null);
    setError(null);
  }, []);

  return {
    generatedPlan,
    loading,
    error,
    generatePlan,
    resetPlan,
  };
}
