'use client';

import React, { useState } from 'react';
import { Project, Task, Epic, User } from '../types';
import { ChevronDown, ChevronRight, Layers, Clock, ShieldAlert, Plus, CheckCircle, X } from 'lucide-react';

interface ListViewProps {
  project: Project;
  tasks: Task[];
  epics: Epic[];
  users: User[];
  onSelectTask: (taskId: string) => void;
  onAddEpic: (epic: Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateEpic?: (epic: Epic) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTask?: (task: Task) => void;
}

export default function ListView({
  project,
  tasks,
  epics,
  users,
  onSelectTask,
  onAddEpic,
  onUpdateEpic,
  onAddTask,
  onUpdateTask,
}: ListViewProps) {
  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({});
  const [isAddingEpic, setIsAddingEpic] = useState(false);
  const [epicTitle, setEpicTitle] = useState('');
  const [epicDesc, setEpicDesc] = useState('');
  const [selectedEpicForModal, setSelectedEpicForModal] = useState<Epic | null>(null);
  const [editEpicTitle, setEditEpicTitle] = useState('');
  const [editEpicDesc, setEditEpicDesc] = useState('');
  const [addingTaskEpicId, setAddingTaskEpicId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskHours, setTaskHours] = useState(8);

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

  const handleOpenEpicModal = (epic: Epic) => {
    setSelectedEpicForModal(epic);
    setEditEpicTitle(epic.title);
    setEditEpicDesc(epic.description || '');
  };

  const handleUpdateEpicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEpicForModal || !editEpicTitle.trim()) return;

    if (onUpdateEpic) {
      onUpdateEpic({
        ...selectedEpicForModal,
        title: editEpicTitle,
        description: editEpicDesc,
        updatedAt: new Date().toISOString(),
      });
    }
    setSelectedEpicForModal(null);
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
      estimatedHours: taskHours > 0 ? taskHours : 8,
      assigneeId: null,
      aiExplanation: 'Quick task added.'
    });

    setTaskTitle('');
    setTaskHours(8);
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

      {/* Centered Square Epic Modal */}
      {(isAddingEpic || selectedEpicForModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            onClick={() => {
              setIsAddingEpic(false);
              setSelectedEpicForModal(null);
            }}
          />

          {/* Square Modal Panel (Enlarged) */}
          <div className="relative w-full max-w-[600px] aspect-square max-h-[92vh] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl flex flex-col justify-between z-10 overflow-hidden">
            {isAddingEpic ? (
              /* Create Epic Modal */
              <form onSubmit={handleCreateEpic} className="h-full flex flex-col justify-between">
                {/* Header */}
                <div className="flex items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-850 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-400">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Create Project Epic</h3>
                      <span className="text-xs text-zinc-500 font-medium">Add a high-level milestone and deliverable stream</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingEpic(false)}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Inputs */}
                <div className="flex-1 py-5 space-y-5 overflow-y-auto pr-1">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Epic Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Core Authentication & Database Architecture"
                      value={epicTitle}
                      onChange={(e) => setEpicTitle(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-medium transition-colors"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2 flex flex-col flex-1">
                    <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Description & Scope
                    </label>
                    <textarea
                      placeholder="Outline the architectural goals, core deliverables, and prerequisites..."
                      value={epicDesc}
                      onChange={(e) => setEpicDesc(e.target.value)}
                      className="w-full h-44 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed transition-colors"
                    />
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-850 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddingEpic(false)}
                    className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all active:scale-[0.98] shadow-md shadow-indigo-600/10"
                  >
                    Save Epic
                  </button>
                </div>
              </form>
            ) : selectedEpicForModal ? (
              /* View/Edit Existing Epic Modal */
              <form onSubmit={handleUpdateEpicSubmit} className="h-full flex flex-col justify-between">
                {/* Header */}
                <div className="flex items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-850 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-400">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Epic Details</h3>
                      <span className="text-xs text-zinc-500 font-medium">View and update milestone scope</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedEpicForModal(null)}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 py-5 space-y-5 overflow-y-auto pr-1">
                  {/* Stats Pill */}
                  {(() => {
                    const modalEpicTasks = tasksByEpic[selectedEpicForModal.id] || [];
                    const doneCount = modalEpicTasks.filter((t) => t.status === 'DONE').length;
                    const hours = modalEpicTasks.reduce((s, t) => s + (t.estimatedHours || 0), 0);

                    return (
                      <div className="grid grid-cols-3 gap-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-850 p-3.5 rounded-2xl text-center">
                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">Tasks</span>
                          <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">{modalEpicTasks.length}</span>
                        </div>
                        <div className="border-x border-zinc-200 dark:border-zinc-800">
                          <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">Completed</span>
                          <span className="text-sm font-extrabold text-emerald-500">{doneCount}/{modalEpicTasks.length}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">Effort</span>
                          <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">{hours}h</span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Epic Title
                    </label>
                    <input
                      type="text"
                      value={editEpicTitle}
                      onChange={(e) => setEditEpicTitle(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 font-semibold transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-2 flex flex-col flex-1">
                    <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Description & Scope
                    </label>
                    <textarea
                      value={editEpicDesc}
                      onChange={(e) => setEditEpicDesc(e.target.value)}
                      placeholder="Add detailed epic description..."
                      className="w-full h-36 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed transition-colors"
                    />
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-850 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedEpicForModal(null)}
                    className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all active:scale-[0.98] shadow-md shadow-indigo-600/10"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : null}
          </div>
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
                onClick={() => handleOpenEpicModal(epic)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-50 dark:bg-zinc-900/40 select-none group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleEpic(epic.id);
                    }}
                    className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
                    title={isExpanded ? 'Collapse tasks' : 'Expand tasks'}
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1 group-hover:text-indigo-400 transition-colors">{epic.title}</h3>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-500 line-clamp-1 mt-0.5">{epic.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[10px] text-zinc-600 dark:text-zinc-400 font-medium shrink-0">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 font-semibold border border-zinc-200 dark:border-zinc-800">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> Execution Time: <strong className="text-zinc-900 dark:text-zinc-100">{totalHours}h</strong>
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
                          <th className="pb-2 w-[40%]">Task Title</th>
                          <th className="pb-2 w-[15%]">Status</th>
                          <th className="pb-2 w-[15%]">Priority</th>
                          <th className="pb-2 w-[16%]">Execution Time</th>
                          <th className="pb-2 w-[14%]">Assignee</th>
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
                      <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Task Title..."
                          value={taskTitle}
                          onChange={(e) => setTaskTitle(e.target.value)}
                          className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500"
                          autoFocus
                        />
                        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={taskHours}
                            onChange={(e) => setTaskHours(Number(e.target.value))}
                            className="w-10 bg-transparent text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none text-center"
                            title="Execution Time (Hours)"
                          />
                          <span className="text-[10px] text-zinc-500">h</span>
                        </div>
                        <button
                          onClick={() => handleCreateQuickTask(epic.id)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl shrink-0"
                        >
                          Save Task
                        </button>
                        <button
                          onClick={() => setAddingTaskEpicId(null)}
                          className="border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs px-3 py-1.5 rounded-xl hover:text-zinc-800 dark:text-zinc-200 shrink-0"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddingTaskEpicId(epic.id); setTaskTitle(''); setTaskHours(8); }}
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
                    <th className="pb-2 w-[40%]">Task Title</th>
                    <th className="pb-2 w-[15%]">Status</th>
                    <th className="pb-2 w-[15%]">Priority</th>
                    <th className="pb-2 w-[16%]">Execution Time</th>
                    <th className="pb-2 w-[14%]">Assignee</th>
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
