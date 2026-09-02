'use client';

import React from 'react';
import { Project, Task, Epic, User, ProjectHealth } from '../types';
import { CheckCircle2, AlertTriangle, Clock, Layers, ArrowRight, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';

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
      {/* Welcome Banner - Ultra Premium Mesh Gradient */}
      <div className="relative overflow-hidden rounded-3xl border border-white/40 dark:border-white/10 bg-gradient-to-b from-indigo-100 to-white/60 dark:from-indigo-950/80 dark:to-zinc-900/90 p-8 backdrop-blur-xl shadow-xl shadow-indigo-500/5 dark:shadow-indigo-500/10 transition-all">
        {/* Animated Background Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-zinc-800/60 border border-indigo-100 dark:border-zinc-700/50 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-widest shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> AI Diagnostic Active
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-zinc-900 via-indigo-900 to-zinc-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent">
              Welcome back, Developer!
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-xl leading-relaxed font-medium">
              Your AI co-pilot has analyzed your workspace. You currently have <span className="font-bold text-indigo-600 dark:text-indigo-400">{inProgressTasks} active tasks</span>, and your overall project trajectory is rated as <span className="font-bold text-emerald-600 dark:text-emerald-400">Excellent</span>.
            </p>
          </div>
          <button
            onClick={() => onNavigateToView('planner')}
            className="group self-start md:self-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm px-6 py-3.5 rounded-2xl flex items-center gap-2.5 transition-all active:scale-[0.97] shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 border border-white/10"
          >
            Generate Project Plan 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Metrics Row - Premium Glassmorphism */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Workspace Health Card */}
        <div className="group bg-white/70 dark:bg-zinc-900/50 backdrop-blur-lg border border-white/50 dark:border-white/5 p-6 rounded-3xl flex items-center justify-between relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl group-hover:bg-emerald-400/20 transition-all" />
          <div className="space-y-1.5 relative z-10">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Health Score</span>
            <div className="text-3xl font-extrabold bg-gradient-to-br from-emerald-500 to-teal-400 bg-clip-text text-transparent">{avgHealth}%</div>
            <span className="text-[10px] text-zinc-400 font-medium">Weighted Workspace Avg</span>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center drop-shadow-md">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-100 dark:text-zinc-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                strokeDasharray={`${avgHealth}, 100`}
                strokeWidth="4"
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
        <div className="group bg-white/70 dark:bg-zinc-900/50 backdrop-blur-lg border border-white/50 dark:border-white/5 p-6 rounded-3xl flex items-center justify-between relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-400/10 rounded-full blur-2xl group-hover:bg-indigo-400/20 transition-all" />
          <div className="space-y-1.5 flex-1 relative z-10">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Task Progress</span>
            <div className="text-3xl font-extrabold text-zinc-800 dark:text-white">
              {completedTasks}<span className="text-sm font-medium text-zinc-400"> / {totalTasks}</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full h-2 mt-3 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
              </div>
            </div>
          </div>
        </div>

        {/* Hours Logged Card */}
        <div className="group bg-white/70 dark:bg-zinc-900/50 backdrop-blur-lg border border-white/50 dark:border-white/5 p-6 rounded-3xl flex items-center justify-between relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-violet-400/10 rounded-full blur-2xl group-hover:bg-violet-400/20 transition-all" />
          <div className="space-y-1.5 flex-1 relative z-10">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Time Tracked</span>
            <div className="text-3xl font-extrabold text-zinc-800 dark:text-white">
              {doneHours}<span className="text-sm font-medium text-zinc-400">h / {totalHours}h</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full h-2 mt-3 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${totalHours > 0 ? (doneHours / totalHours) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Active Epics Card */}
        <div className="group bg-white/70 dark:bg-zinc-900/50 backdrop-blur-lg border border-white/50 dark:border-white/5 p-6 rounded-3xl flex items-center justify-between relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-all" />
          <div className="space-y-1.5 relative z-10">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Active Epics</span>
            <div className="text-3xl font-extrabold text-zinc-800 dark:text-white">{epics.length}</div>
            <span className="text-[10px] text-zinc-400 font-medium block">Across {projects.length} workspaces</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-inner group-hover:scale-110 transition-transform">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts & Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Projects list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              Active Projects <span className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">({projects.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => {
              const health = getProjectHealth(project.id);
              const pTasks = tasks.filter(t => t.projectId === project.id);
              const donePTasks = pTasks.filter(t => t.status === 'DONE').length;
              const percent = pTasks.length > 0 ? Math.round((donePTasks / pTasks.length) * 100) : 0;

              return (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className="bg-zinc-50 dark:bg-zinc-900/30 hover:bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:border-zinc-700/80 p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {project.name}
                      </h3>
                      <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        health.score >= 80
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                          : health.score >= 60
                          ? 'bg-amber-500/5 border-amber-500/20 text-amber-400'
                          : 'bg-red-500/5 border-red-500/20 text-red-400'
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
                    <div className="w-full bg-white dark:bg-zinc-950 rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          health.score >= 80 ? 'bg-emerald-500' : health.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-500 pt-1">
                      <span>Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}</span>
                      <span className="text-indigo-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        Open Board <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Advisor Panel */}
          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-1.5">
                  AI Task Optimizer Suggestions
                </h3>
                <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-2">
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Resource Overload Alert:</strong> Alex Developer has <strong>24 hours</strong> of tasks assigned (most of which are URGENT) in the <em>Online Examination System</em>. Meanwhile, David PM has 0 tasks assigned.
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Reallocation Plan:</strong> We suggest transferring <em>"Create Exam Builder Form and Admin UI"</em> (Estimated: 16h) to David PM to speed up Weekly Sprint deliverables by 4 days.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Workspace Analytics */}
        <div className="bg-white/70 dark:bg-zinc-900/50 backdrop-blur-lg border border-white/50 dark:border-white/5 p-6 rounded-3xl space-y-8 shadow-sm">
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            Analytics Overview
          </h2>

          {/* Priority Breakdown (Stunning Animated Bar Chart) */}
          <div className="space-y-4">
            <h3 className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Priority Heatmap</h3>
            <div className="flex items-end justify-between gap-3 h-36 pt-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-2">
              {[
                { name: 'Urgent', count: tasks.filter(t => t.priority === 'URGENT').length, bg: 'from-rose-500 to-red-600' },
                { name: 'High', count: tasks.filter(t => t.priority === 'HIGH').length, bg: 'from-orange-400 to-amber-500' },
                { name: 'Medium', count: tasks.filter(t => t.priority === 'MEDIUM').length, bg: 'from-yellow-400 to-amber-400' },
                { name: 'Low', count: tasks.filter(t => t.priority === 'LOW').length, bg: 'from-sky-400 to-blue-500' },
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
                    <div className="absolute -top-6 text-[11px] font-extrabold text-zinc-700 dark:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:-translate-y-1">{p.count}</div>
                    <div
                      className={`w-full rounded-t-xl transition-all duration-700 ease-out bg-gradient-to-t ${p.bg} shadow-lg shadow-${p.bg.split('-')[1]}-500/30 group-hover:scale-105 group-hover:brightness-110 cursor-pointer`}
                      style={{ height: `${Math.max(pct, 12)}%` }}
                    />
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide truncate w-full text-center mt-1">{p.name}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task Status Breakdown list */}
          <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-4 space-y-3">
            <h3 className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold">Status Breakdown</h3>
            <div className="space-y-2">
              {[
                { name: 'To Do', count: todoTasks, pct: totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0, color: 'bg-zinc-400 dark:bg-zinc-700' },
                { name: 'In Progress', count: inProgressTasks, pct: totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0, color: 'bg-indigo-500' },
                { name: 'In Review', count: reviewTasks, pct: totalTasks > 0 ? (reviewTasks / totalTasks) * 100 : 0, color: 'bg-violet-500' },
                { name: 'Done', count: completedTasks, pct: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0, color: 'bg-emerald-500' },
              ].map((s, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    <span>{s.name}</span>
                    <span>{s.count} tasks ({Math.round(s.pct)}%)</span>
                  </div>
                  <div className="w-full bg-white dark:bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Effort Allocation by Team Member */}
          <div className="border-t border-zinc-200 dark:border-zinc-800/80 pt-4 space-y-3">
            <h3 className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold">Team Allocation (Hours)</h3>
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
                      <div className="w-full bg-white dark:bg-zinc-950 rounded-full h-1.5 mt-1">
                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
