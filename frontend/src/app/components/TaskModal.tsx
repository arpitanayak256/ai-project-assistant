'use client';

import React, { useState } from 'react';
import { Project, Task, Epic, User, Subtask, TaskStatus, TaskPriority } from '../types';
import { X, CheckSquare, Plus, Trash, Sparkles, Clock, Calendar, CheckSquare as CheckIcon, AlertTriangle } from 'lucide-react';

interface TaskModalProps {
  task: Task;
  epics: Epic[];
  users: User[];
  subtasks: Subtask[];
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
  onAddSubtask: (subtask: Omit<Subtask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onToggleSubtask: (subtaskId: string, completed: boolean) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onGenerateSubtasks: (taskId: string, taskTitle: string) => void;
}

export default function TaskModal({
  task,
  epics,
  users,
  subtasks,
  onClose,
  onUpdateTask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onGenerateSubtasks,
}: TaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [hours, setHours] = useState(task.estimatedHours || 8);
  const [assigneeId, setAssigneeId] = useState<string | null>(task.assigneeId || null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);

  const taskSubtasks = subtasks.filter(s => s.taskId === task.id);
  const completedSubtasks = taskSubtasks.filter(s => s.completed).length;

  const handleSaveChanges = () => {
    onUpdateTask({
      ...task,
      title,
      description,
      status,
      priority,
      estimatedHours: hours,
      assigneeId: assigneeId === 'NONE' ? null : assigneeId,
    });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    onAddSubtask({
      taskId: task.id,
      title: newSubtaskTitle,
      completed: false
    });

    setNewSubtaskTitle('');
  };

  const triggerAIBreakdown = () => {
    setIsGeneratingSubtasks(true);
    setTimeout(() => {
      onGenerateSubtasks(task.id, task.title);
      setIsGeneratingSubtasks(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-lg h-full bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col justify-between shadow-2xl relative z-10 animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-850 pb-4 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-400" /> AI Task Assistant
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-905 border border-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Title Editor */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveChanges}
              className="w-full bg-transparent border-0 border-b border-transparent hover:border-zinc-800 focus:border-indigo-500 text-sm font-bold text-zinc-100 py-1.5 px-0 focus:outline-none"
            />
          </div>

          {/* Core Properties Selects */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Status</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value as any); onUpdateTask({ ...task, status: e.target.value as any }); }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Priority</label>
              <select
                value={priority}
                onChange={(e) => { setPriority(e.target.value as any); onUpdateTask({ ...task, priority: e.target.value as any }); }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Assignee</label>
              <select
                value={assigneeId || 'NONE'}
                onChange={(e) => { setAssigneeId(e.target.value); onUpdateTask({ ...task, assigneeId: e.target.value === 'NONE' ? null : e.target.value }); }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none"
              >
                <option value="NONE">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Estimated Hours</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-550" />
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => { setHours(Number(e.target.value)); onUpdateTask({ ...task, estimatedHours: Number(e.target.value) }); }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs text-zinc-300 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase">Detailed Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSaveChanges}
              placeholder="Add detailed task requirements..."
              className="w-full h-24 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 placeholder-zinc-650 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>

          {/* Subtasks Checklists */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Subtasks Checklist ({completedSubtasks}/{taskSubtasks.length})</label>
              <button
                type="button"
                onClick={triggerAIBreakdown}
                disabled={isGeneratingSubtasks}
                className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/5 px-2 py-1 rounded-lg border border-indigo-500/20 transition-all disabled:opacity-50"
              >
                {isGeneratingSubtasks ? (
                  <span className="w-2.5 h-2.5 border border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <Sparkles className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                )}
                AI Breakdown
              </button>
            </div>

            {/* Subtasks listing */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {taskSubtasks.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-zinc-900/50 border border-zinc-850 hover:bg-zinc-900 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={(e) => onToggleSubtask(sub.id, e.target.checked)}
                      className="w-3.5 h-3.5 bg-zinc-950 border border-zinc-800 text-indigo-650 focus:ring-indigo-500 rounded cursor-pointer"
                    />
                    <span className={`text-[11px] truncate leading-normal ${sub.completed ? 'line-through text-zinc-550' : 'text-zinc-300'}`}>
                      {sub.title}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteSubtask(sub.id)}
                    className="p-1 hover:bg-zinc-800/80 text-zinc-500 hover:text-red-400 rounded shrink-0"
                  >
                    <Trash className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {taskSubtasks.length === 0 && !isGeneratingSubtasks && (
                <div className="text-center py-6 text-zinc-650 text-[10px]">
                  No subtasks. Try using the AI Breakdown!
                </div>
              )}
            </div>

            {/* Add custom subtask input */}
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3 rounded-xl flex items-center justify-center shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* AI Estimation Rationale */}
          {task.aiExplanation && (
            <div className="bg-indigo-950/20 border border-indigo-900/30 p-4 rounded-xl space-y-2">
              <h5 className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" /> AI Estimation Explanation
              </h5>
              <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">{task.aiExplanation}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-850 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
          >
            Save & Exit
          </button>
        </div>
      </div>
    </div>
  );
}
