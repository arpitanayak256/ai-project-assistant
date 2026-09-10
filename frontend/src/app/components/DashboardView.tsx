'use client';

import React from 'react';
import { Project, Task, Epic, User, ProjectHealth } from '../types';
import { Layers, ArrowRight, Sparkles } from 'lucide-react';

interface DashboardViewProps {
  projects: Project[];
  tasks: Task[];
  epics: Epic[];
  users: User[];
  onSelectProject: (projectId: string) => void;
  onNavigateToView: (view: string) => void;
  getProjectHealth: (projectId: string) => ProjectHealth;
}

export default function DashboardView({
  projects,
  tasks,
  epics,
  users,
  onSelectProject,
  onNavigateToView,
  getProjectHealth,
}: DashboardViewProps) {
  // Aggregate stats across all projects
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const reviewTasks = tasks.filter(t => t.status === 'IN_REVIEW').length;
  const todoTasks = tasks.filter(t => t.status === 'TODO').length;

  const totalHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const doneHours = tasks.filter(t => t.status === 'DONE').reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

  // Compute overall workspace health score average
  const avgHealth = Math.round(
    projects.reduce((sum, p) => sum + getProjectHealth(p.id).score, 0) / (projects.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner - Clean Minimalist */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-[10px] uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> AI Diagnostic Active
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Welcome back, Developer!
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-xl leading-relaxed font-medium">
              Your AI co-pilot has analyzed your workspace. You currently have <span className="font-semibold text-zinc-900 dark:text-zinc-100">{inProgressTasks} active tasks</span>, and your overall project trajectory is rated as <span className="font-semibold text-emerald-600 dark:text-emerald-400">Excellent</span>.
            </p>
          </div>
          <button
            onClick={() => onNavigateToView('planner')}
            className="group self-start md:self-auto bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold text-sm px-6 py-3.5 rounded-2xl flex items-center gap-2.5 transition-all active:scale-[0.97] shadow-sm"
          >
            Generate Project Plan 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Workspace Health Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl flex items-center justify-between shadow-sm">
          <div className="space-y-1.5">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Health Score</span>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">{avgHealth}%</div>
            <span className="text-[10px] text-zinc-400 font-medium">Weighted Workspace Avg</span>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-100 dark:text-zinc-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-1000 ease-out"
                strokeDasharray={`${avgHealth}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{avgHealth}%</span>
          </div>
        </div>

        {/* Task Completion Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl flex items-center justify-between shadow-sm">
          <div className="space-y-1.5 flex-1">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Task Progress</span>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {completedTasks}<span className="text-sm font-medium text-zinc-400"> / {totalTasks}</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-zinc-900 dark:bg-zinc-100 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hours Logged Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl flex items-center justify-between shadow-sm">
          <div className="space-y-1.5 flex-1">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Time Tracked</span>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {doneHours}<span className="text-sm font-medium text-zinc-400">h / {totalHours}h</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-zinc-900 dark:bg-zinc-100 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${totalHours > 0 ? (doneHours / totalHours) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Active Epics Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl flex items-center justify-between shadow-sm">
          <div className="space-y-1.5">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Active Epics</span>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">{epics.length}</div>
            <span className="text-[10px] text-zinc-400 font-medium block">Across {projects.length} workspaces</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Analytics Row: Diagram (Left) + Status & Team (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Analytics Overview Diagram */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl space-y-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Analytics Overview
            </h2>
            <p className="text-xs text-zinc-500 font-medium">Task distribution categorized by priority level</p>
          </div>

          {/* Priority Heatmap Bar Chart */}
          <div className="flex-1 flex flex-col justify-end space-y-4 pt-4">
            <div className="flex items-end justify-between gap-4 h-48 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              {[
                { name: 'Urgent', count: tasks.filter(t => t.priority === 'URGENT').length, bg: 'bg-red-500 dark:bg-red-500' },
                { name: 'High', count: tasks.filter(t => t.priority === 'HIGH').length, bg: 'bg-amber-500 dark:bg-amber-500' },
                { name: 'Medium', count: tasks.filter(t => t.priority === 'MEDIUM').length, bg: 'bg-zinc-400 dark:bg-zinc-500' },
                { name: 'Low', count: tasks.filter(t => t.priority === 'LOW').length, bg: 'bg-zinc-200 dark:bg-zinc-700' },
              ].map((p, idx) => {
                const maxCount = Math.max(...[
                  tasks.filter(t => t.priority === 'URGENT').length,
                  tasks.filter(t => t.priority === 'HIGH').length,
                  tasks.filter(t => t.priority === 'MEDIUM').length,
                  tasks.filter(t => t.priority === 'LOW').length,
                ]) || 1;
                const pct = (p.count / maxCount) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                    <div className="text-xs font-extrabold text-zinc-700 dark:text-zinc-200 mb-1">
                      {p.count}
                    </div>
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ${p.bg} hover:opacity-80 cursor-pointer`}
                      style={{ height: `${Math.max(pct, 12)}%` }}
                    />
                    <div className="text-[11px] text-zinc-500 font-bold uppercase tracking-wide truncate w-full text-center mt-1">
                      {p.name}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Total Tasks</span>
                <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">{totalTasks}</span>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Total Hours</span>
                <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">{totalHours}h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Status Breakdown & Team Allocation */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl space-y-6 shadow-sm">
          {/* Task Status Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Status Breakdown</h3>
            <div className="space-y-2.5">
              {[
                { name: 'To Do', count: todoTasks, pct: totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0, color: 'bg-zinc-300 dark:bg-zinc-700' },
                { name: 'In Progress', count: inProgressTasks, pct: totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0, color: 'bg-blue-500 dark:bg-blue-400' },
                { name: 'In Review', count: reviewTasks, pct: totalTasks > 0 ? (reviewTasks / totalTasks) * 100 : 0, color: 'bg-amber-500 dark:bg-amber-400' },
                { name: 'Done', count: completedTasks, pct: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0, color: 'bg-emerald-500 dark:bg-emerald-400' },
              ].map((s, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    <span>{s.name}</span>
                    <span>{s.count} tasks ({Math.round(s.pct)}%)</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Effort Allocation by Team Member */}
          <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-5 space-y-3">
            <h3 className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Team Allocation (Hours)</h3>
            <div className="space-y-3">
              {users.map((user) => {
                const uTasks = tasks.filter(t => t.assigneeId === user.id);
                const uHours = uTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
                const percent = totalHours > 0 ? (uHours / totalHours) * 100 : 0;

                return (
                  <div key={user.id} className="flex items-center gap-3">
                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-700" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        <span className="truncate">{user.name.split(' ')[0]}</span>
                        <span>{uHours}h ({uTasks.length} tasks)</span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 mt-1">
                        <div className="bg-zinc-900 dark:bg-zinc-100 h-1.5 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Active Projects List (Below Analytics) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            Active Projects <span className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">({projects.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const health = getProjectHealth(project.id);
            const pTasks = tasks.filter(t => t.projectId === project.id);
            const donePTasks = pTasks.filter(t => t.status === 'DONE').length;
            const percent = pTasks.length > 0 ? Math.round((donePTasks / pTasks.length) * 100) : 0;

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors line-clamp-1">
                      {project.name}
                    </h3>
                    <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      health.score >= 80
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400'
                        : health.score >= 60
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400'
                        : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400'
                    }`}>
                      Health: {health.score}%
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 min-h-[2rem]">
                    {project.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/60 space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-zinc-600 dark:text-zinc-400 font-semibold">
                    <span>Tasks Progress ({donePTasks}/{pTasks.length})</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        health.score >= 80 ? 'bg-emerald-500' : health.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-500 pt-1">
                    <span>Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}</span>
                    <span className="text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      Open Board <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
