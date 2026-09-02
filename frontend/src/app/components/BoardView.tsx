'use client';

import React, { useState } from 'react';
import { Project, Task, Epic, User, Subtask, TaskStatus } from '../types';
import { Plus, ArrowLeft, ArrowRight, Clock, CheckSquare, Sparkles } from 'lucide-react';

interface BoardViewProps {
  project: Project;
  tasks: Task[];
  epics: Epic[];
  users: User[];
  subtasks: Subtask[];
  onSelectTask: (taskId: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
}

export default function BoardView({
  project,
  tasks,
  epics,
  users,
  subtasks,
  onSelectTask,
  onAddTask,
  onUpdateTaskStatus,
}: BoardViewProps) {
  const [selectedEpicId, setSelectedEpicId] = useState<string>('ALL');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEpicId, setNewEpicId] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [newHours, setNewHours] = useState(8);

  // Filter tasks belonging to current project and epic
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const filteredTasks = selectedEpicId === 'ALL'
    ? projectTasks
    : projectTasks.filter(t => t.epicId === selectedEpicId);

  const columns: { id: TaskStatus; title: string; color: string; border: string }[] = [
    { id: 'TODO', title: 'To Do', color: 'bg-zinc-100 dark:bg-zinc-800/10', border: 'border-zinc-200 dark:border-zinc-800' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-indigo-500/5', border: 'border-indigo-500/20' },
    { id: 'IN_REVIEW', title: 'In Review', color: 'bg-violet-500/5', border: 'border-violet-500/20' },
    { id: 'DONE', title: 'Done', color: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
  ];

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      projectId: project.id,
      epicId: newEpicId === 'NONE' || !newEpicId ? null : newEpicId,
      title: newTitle,
      description: 'Add detailed description...',
      status: 'TODO',
      priority: newPriority,
      estimatedHours: newHours,
      assigneeId: null,
      aiExplanation: 'Custom task added by user.'
    });

    setNewTitle('');
    setIsAddingTask(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'HIGH': return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
      case 'MEDIUM': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'LOW': return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      default: return 'bg-zinc-500/10 border-zinc-500/30 text-zinc-600 dark:text-zinc-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/80 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wide">Epic Filter:</span>
          <select
            value={selectedEpicId}
            onChange={(e) => setSelectedEpicId(e.target.value)}
            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Epics</option>
            {epics.filter(e => e.projectId === project.id).map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsAddingTask(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Task Creator Dialog */}
      {isAddingTask && (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl animate-slide-down">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-3 uppercase tracking-wide">Create Workspace Task</h3>
          <form onSubmit={handleAddTaskSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase">Task Title</label>
              <input
                type="text"
                placeholder="e.g. Implement stripe payments webhook listeners"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 placeholder-zinc-650 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase">Epic Link</label>
              <select
                value={newEpicId}
                onChange={(e) => setNewEpicId(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="NONE">No Epic</option>
                {epics.filter(e => e.projectId === project.id).map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase">Hours (Est)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={newHours}
                  onChange={(e) => setNewHours(Number(e.target.value))}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-850">
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
              >
                Submit Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-2xl border ${col.border} ${col.color} p-4 flex flex-col min-h-[480px]`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800/80 mb-3">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  {col.title}
                  <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-850 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
                    {colTasks.length}
                  </span>
                </span>
              </div>

              {/* Task List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="text-[10px] text-zinc-650 text-center py-8">
                    No tasks in this stage
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const epic = epics.find(e => e.id === task.epicId);
                    const assignee = users.find(u => u.id === task.assigneeId);
                    const taskSubtasks = subtasks.filter(s => s.taskId === task.id);
                    const completedSubtasks = taskSubtasks.filter(s => s.completed).length;

                    return (
                      <div
                        key={task.id}
                        className="bg-white dark:bg-zinc-950/70 hover:bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-lg relative group transition-all duration-200 cursor-pointer"
                        onClick={() => onSelectTask(task.id)}
                      >
                        {/* Task Card Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          {epic && (
                            <span className="text-[9px] text-indigo-400/80 font-bold truncate max-w-[100px]">
                              {epic.title}
                            </span>
                          )}
                        </div>

                        {/* Task Title */}
                        <h4 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-relaxed group-hover:text-indigo-300 transition-colors">
                          {task.title}
                        </h4>

                        {/* Task Meta details */}
                        <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[9px] text-zinc-550">
                            {task.estimatedHours && (
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3" /> {task.estimatedHours}h
                              </span>
                            )}
                            {taskSubtasks.length > 0 && (
                              <span className="flex items-center gap-0.5 text-zinc-600 dark:text-zinc-400">
                                <CheckSquare className="w-3 h-3 text-indigo-400/60" /> {completedSubtasks}/{taskSubtasks.length}
                              </span>
                            )}
                          </div>

                          {/* Assignee Avatar */}
                          {assignee ? (
                            <img
                              src={assignee.avatarUrl}
                              alt={assignee.name}
                              title={assignee.name}
                              className="w-5 h-5 rounded-full border border-zinc-200 dark:border-zinc-800"
                            />
                          ) : (
                            <div
                              title="Unassigned"
                              className="w-5 h-5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[8px] text-zinc-500 dark:text-zinc-500 font-bold"
                            >
                              ?
                            </div>
                          )}
                        </div>

                        {/* Floating Stage Controls (Interactive Buttons) */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-1 rounded-lg"
                        >
                          {col.id !== 'TODO' && (
                            <button
                              onClick={() => {
                                const prevStages: Record<TaskStatus, TaskStatus> = {
                                  TODO: 'TODO',
                                  IN_PROGRESS: 'TODO',
                                  IN_REVIEW: 'IN_PROGRESS',
                                  DONE: 'IN_REVIEW',
                                };
                                onUpdateTaskStatus(task.id, prevStages[col.id]);
                              }}
                              className="p-1 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 rounded"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {col.id !== 'DONE' && (
                            <button
                              onClick={() => {
                                const nextStages: Record<TaskStatus, TaskStatus> = {
                                  TODO: 'IN_PROGRESS',
                                  IN_PROGRESS: 'IN_REVIEW',
                                  IN_REVIEW: 'DONE',
                                  DONE: 'DONE',
                                };
                                onUpdateTaskStatus(task.id, nextStages[col.id]);
                              }}
                              className="p-1 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-indigo-400 rounded"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
