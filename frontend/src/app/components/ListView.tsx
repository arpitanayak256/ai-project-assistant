'use client';

import React, { useState } from 'react';
import { Project, Task, Epic, User } from '../types';
import { ChevronDown, ChevronRight, Layers, Clock, ShieldAlert, Plus, CheckCircle } from 'lucide-react';

interface ListViewProps {
  project: Project;
  tasks: Task[];
  epics: Epic[];
  users: User[];
  onSelectTask: (taskId: string) => void;
  onAddEpic: (epic: Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export default function ListView({
  project,
  tasks,
  epics,
  users,
  onSelectTask,
  onAddEpic,
  onAddTask,
}: ListViewProps) {
  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({});
  const [isAddingEpic, setIsAddingEpic] = useState(false);
  const [epicTitle, setEpicTitle] = useState('');
  const [epicDesc, setEpicDesc] = useState('');
  const [addingTaskEpicId, setAddingTaskEpicId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');

  const projectEpics = epics.filter(e => e.projectId === project.id);
  const projectTasks = tasks.filter(t => t.projectId === project.id);

  // Group tasks by epic
  const tasksByEpic: Record<string, Task[]> = {};
  const unassignedTasks: Task[] = [];

  projectTasks.forEach(task => {
    if (task.epicId) {
      if (!tasksByEpic[task.epicId]) tasksByEpic[task.epicId] = [];
      tasksByEpic[task.epicId].push(task);
    } else {
      unassignedTasks.push(task);
    }
  });

  const toggleEpic = (epicId: string) => {
    setExpandedEpics(prev => ({
      ...prev,
      [epicId]: !prev[epicId]
    }));
  };

  const handleCreateEpic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!epicTitle.trim()) return;

    onAddEpic({
      projectId: project.id,
      title: epicTitle,
      description: epicDesc || 'Epic workspace description.'
    });

    setEpicTitle('');
    setEpicDesc('');
    setIsAddingEpic(false);
  };

  const handleCreateQuickTask = (epicId: string | null) => {
    if (!taskTitle.trim()) return;

    onAddTask({
      projectId: project.id,
      epicId: epicId,
      title: taskTitle,
      description: 'Add detailed description...',
      status: 'TODO',
      priority: 'MEDIUM',
      estimatedHours: 8,
      assigneeId: null,
      aiExplanation: 'Quick task added.'
    });

    setTaskTitle('');
    setAddingTaskEpicId(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-400';
      case 'HIGH': return 'text-orange-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'LOW': return 'text-blue-400';
      default: return 'text-zinc-600 dark:text-zinc-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700/50';
      case 'IN_PROGRESS': return 'bg-indigo-950 text-indigo-400 border border-indigo-500/20';
      case 'IN_REVIEW': return 'bg-violet-950 text-violet-400 border border-violet-500/20';
      case 'DONE': return 'bg-emerald-950 text-emerald-400 border border-emerald-500/20';
      default: return 'bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Epic Actions */}
      <div className="flex justify-end items-center">
        <button
          onClick={() => setIsAddingEpic(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> Add Epic
        </button>
      </div>

      {/* Epic Creator Form */}
      {isAddingEpic && (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl animate-slide-down">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-3 uppercase tracking-wide">Create Project Epic</h3>
          <form onSubmit={handleCreateEpic} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase">Epic Name</label>
              <input
                type="text"
                placeholder="e.g. Database & API Foundation"
                value={epicTitle}
                onChange={(e) => setEpicTitle(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase">Description</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Set up core schemas, schemas migrations, API route auth filters..."
                  value={epicDesc}
                  onChange={(e) => setEpicDesc(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shrink-0"
                >
                  Save Epic
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Epics List */}
      <div className="space-y-3">
        {projectEpics.map((epic) => {
          const epicTasks = tasksByEpic[epic.id] || [];
          const isExpanded = !expandedEpics[epic.id]; // default expanded
          const completedTasks = epicTasks.filter(t => t.status === 'DONE').length;
          const totalHours = epicTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

          return (
            <div key={epic.id} className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-850 rounded-2xl overflow-hidden">
              {/* Epic Summary Header */}
              <div
                onClick={() => toggleEpic(epic.id)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-50 dark:bg-zinc-900/40 select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-zinc-500 dark:text-zinc-500">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1">{epic.title}</h3>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-500 line-clamp-1 mt-0.5">{epic.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[10px] text-zinc-600 dark:text-zinc-400 font-medium shrink-0">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-550" /> {totalHours}h estimated
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {completedTasks}/{epicTasks.length} tasks done
                  </span>
                </div>
              </div>

              {/* Epic Tasks List Accordion Body */}
              {isExpanded && (
                <div className="p-4 bg-white dark:bg-zinc-950/30 space-y-3 animate-fade-in">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase">
                          <th className="pb-2 w-[45%]">Task Title</th>
                          <th className="pb-2 w-[15%]">Status</th>
                          <th className="pb-2 w-[15%]">Priority</th>
                          <th className="pb-2 w-[12%]">Estimate</th>
                          <th className="pb-2 w-[13%]">Assignee</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {epicTasks.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-zinc-650 text-[10px]">
                              No tasks in this epic. Add one below.
                            </td>
                          </tr>
                        ) : (
                          epicTasks.map((task) => {
                            const assignee = users.find(u => u.id === task.assigneeId);

                            return (
                              <tr
                                key={task.id}
                                onClick={() => onSelectTask(task.id)}
                                className="group hover:bg-zinc-50 dark:bg-zinc-900/30 cursor-pointer"
                              >
                                <td className="py-3 font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-400 transition-colors pr-2">
                                  {task.title}
                                </td>
                                <td className="py-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusColor(task.status)}`}>
                                    {task.status}
                                  </span>
                                </td>
                                <td className="py-3 font-bold">
                                  <span className={getPriorityColor(task.priority)}>{task.priority}</span>
                                </td>
                                <td className="py-3 text-zinc-600 dark:text-zinc-400 font-medium">
                                  {task.estimatedHours} hours
                                </td>
                                <td className="py-3">
                                  {assignee ? (
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <img src={assignee.avatarUrl} className="w-5 h-5 rounded-full border border-zinc-200 dark:border-zinc-800 shrink-0" />
                                      <span className="truncate text-zinc-600 dark:text-zinc-400">{assignee.name.split(' ')[0]}</span>
                                    </div>
                                  ) : (
                                    <span className="text-zinc-600 text-[10px] italic">Unassigned</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Quick Task Injector */}
                  <div className="pt-2">
                    {addingTaskEpicId === epic.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Quick Task Title..."
                          value={taskTitle}
                          onChange={(e) => setTaskTitle(e.target.value)}
                          className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => handleCreateQuickTask(epic.id)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3 py-1.5 rounded-xl"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setAddingTaskEpicId(null)}
                          className="border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs px-3 py-1.5 rounded-xl hover:text-zinc-800 dark:text-zinc-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddingTaskEpicId(epic.id); setTaskTitle(''); }}
                        className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 hover:text-indigo-400 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Quick Add Task
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Unassigned Tasks */}
        {unassignedTasks.length > 0 && (
          <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-850 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Unassigned Tasks</h3>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500">Tasks not linked to any specific Epic</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-zinc-950/30">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase">
                    <th className="pb-2 w-[45%]">Task Title</th>
                    <th className="pb-2 w-[15%]">Status</th>
                    <th className="pb-2 w-[15%]">Priority</th>
                    <th className="pb-2 w-[12%]">Estimate</th>
                    <th className="pb-2 w-[13%]">Assignee</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {unassignedTasks.map((task) => {
                    const assignee = users.find(u => u.id === task.assigneeId);

                    return (
                      <tr
                        key={task.id}
                        onClick={() => onSelectTask(task.id)}
                        className="group hover:bg-zinc-50 dark:bg-zinc-900/30 cursor-pointer"
                      >
                        <td className="py-3 font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-400 transition-colors pr-2">
                          {task.title}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="py-3 font-bold">
                          <span className={getPriorityColor(task.priority)}>{task.priority}</span>
                        </td>
                        <td className="py-3 text-zinc-600 dark:text-zinc-400 font-medium">
                          {task.estimatedHours} hours
                        </td>
                        <td className="py-3">
                          {assignee ? (
                            <div className="flex items-center gap-1.5">
                              <img src={assignee.avatarUrl} className="w-5 h-5 rounded-full border border-zinc-200 dark:border-zinc-800" />
                              <span className="truncate text-zinc-600 dark:text-zinc-400">{assignee.name.split(' ')[0]}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-650 text-[10px] italic">Unassigned</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
