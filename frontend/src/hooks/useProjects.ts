'use client';

import { useState, useCallback } from 'react';
import { Project, TaskDependency } from '../app/types';
import { apiRequest } from '../services/api';

export interface FullProjectsResponse {
  projects: Project[];
  dependencies: TaskDependency[];
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFullProjects = useCallback(async (): Promise<FullProjectsResponse> => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<FullProjectsResponse>('/projects/full');
      setProjects(data.projects);
      setDependencies(data.dependencies);
      return data;
    } catch (err: any) {
      const msg = err.message || 'Failed to fetch projects';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const importGeneratedPlan = useCallback(async (plan: any): Promise<Project> => {
    setLoading(true);
    setError(null);
    try {
      const importedProject = await apiRequest<Project>('/projects/import', {
        method: 'POST',
        body: JSON.stringify(plan),
      });

      // Refresh project list after import
      await fetchFullProjects();
      return importedProject;
    } catch (err: any) {
      const msg = err.message || 'Failed to import generated plan';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [fetchFullProjects]);

  return {
    projects,
    dependencies,
    loading,
    error,
    fetchFullProjects,
    importGeneratedPlan,
  };
}
