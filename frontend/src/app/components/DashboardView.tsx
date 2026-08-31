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
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-violet-950/30 to-zinc-900/60 p-6 backdrop-blur-md">
        <div className="absolute top-0 right-0 translate-x-10 -translate-y-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> Workspace Overview
            </div>
            <h1 className="text-2xl font-bold text-zinc-100">Welcome back, Developer!</h1>
            <p className="text-zinc-400 text-sm max-w-xl">
              Here is your AI co-pilot diagnostic report. You have <strong>{inProgressTasks}</strong> tasks in progress, and your overall project health is rated as <strong>Good</strong>.
            </p>
          </div>
          <button
            onClick={() => onNavigateToView('planner')}
            className="self-start md:self-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/15"
          >
            Create AI Project Plan <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Workspace Health Card */}
        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-semibold">Workspace Health</span>
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">{avgHealth}%</div>
            <span className="text-[10px] text-zinc-500 block">Weighted avg score</span>
          </div>
          {/* Radial Graph Mock */}
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-800"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray={`${avgHealth}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-emerald-400">{avgHealth}%</span>
          </div>
        </div>

        {/* Task Completion Card */}
        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1 flex-1">
            <span className="text-xs text-zinc-400 font-semibold">Task Progress</span>
            <div className="text-2xl font-bold text-zinc-200">
              {completedTasks}<span className="text-sm font-medium text-zinc-500"> / {totalTasks}</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-1.5 rounded-full"
                style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 ml-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Hours Logged Card */}
        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1 flex-1">
            <span className="text-xs text-zinc-400 font-semibold">Estimated Effort</span>
            <div className="text-2xl font-bold text-zinc-200">
              {doneHours}<span className="text-sm font-medium text-zinc-500">h / {totalHours}h</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-violet-500 h-1.5 rounded-full"
                style={{ width: `${totalHours > 0 ? (doneHours / totalHours) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400 ml-3">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Active Epics Card */}
        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-semibold">Active Epics</span>
            <div className="text-2xl font-bold text-zinc-200">{epics.length}</div>
            <span className="text-[10px] text-zinc-500 block">Across {projects.length} projects</span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts & Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Projects list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-1.5">
              Active Projects <span className="text-xs text-zinc-500 font-medium">({projects.length})</span>
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
                  className="bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-zinc-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
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
                    <p className="text-xs text-zinc-400 line-clamp-2 min-h-[2rem]">
                      {project.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-800/60 space-y-3">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-semibold">
                      <span>Tasks Progress ({donePTasks}/{pTasks.length})</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          health.score >= 80 ? 'bg-emerald-500' : health.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
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
          <div className="bg-indigo-950/20 border border-indigo-900/40 p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-1.5">
                  AI Task Optimizer Suggestions
                </h3>
                <div className="text-xs text-zinc-300 leading-relaxed space-y-2">
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
        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl space-y-6">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-1.5">
            Workspace Metrics
          </h2>

          {/* Priority Breakdown (Custom SVG chart) */}
          <div className="space-y-3">
            <h3 className="text-xs text-zinc-400 font-semibold">Priority Distribution</h3>
            <div className="flex items-end justify-between gap-2 h-28 pt-2">
              {[
                { name: 'Urgent', count: tasks.filter(t => t.priority === 'URGENT').length, color: 'bg-red-500' },
                { name: 'High', count: tasks.filter(t => t.priority === 'HIGH').length, color: 'bg-orange-500' },
                { name: 'Medium', count: tasks.filter(t => t.priority === 'MEDIUM').length, color: 'bg-yellow-500' },
                { name: 'Low', count: tasks.filter(t => t.priority === 'LOW').length, color: 'bg-blue-500' },
              ].map((p, idx) => {
                const maxCount = Math.max(...[
                  tasks.filter(t => t.priority === 'URGENT').length,
                  tasks.filter(t => t.priority === 'HIGH').length,
                  tasks.filter(t => t.priority === 'MEDIUM').length,
                  tasks.filter(t => t.priority === 'LOW').length,
                ]) || 1;
                const pct = (p.count / maxCount) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="text-[10px] font-bold text-zinc-300">{p.count}</div>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${p.color} opacity-80 group-hover:opacity-100`}
                      style={{ height: `${Math.max(pct, 10)}%` }}
                    />
                    <div className="text-[10px] text-zinc-500 font-semibold truncate w-full text-center">{p.name}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task Status Breakdown list */}
          <div className="border-t border-zinc-800/80 pt-4 space-y-3">
            <h3 className="text-xs text-zinc-400 font-semibold">Status Breakdown</h3>
            <div className="space-y-2">
              {[
                { name: 'To Do', count: todoTasks, pct: totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0, color: 'bg-zinc-700' },
                { name: 'In Progress', count: inProgressTasks, pct: totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0, color: 'bg-indigo-500' },
                { name: 'In Review', count: reviewTasks, pct: totalTasks > 0 ? (reviewTasks / totalTasks) * 100 : 0, color: 'bg-violet-500' },
                { name: 'Done', count: completedTasks, pct: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0, color: 'bg-emerald-500' },
              ].map((s, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-zinc-400">
                    <span>{s.name}</span>
                    <span>{s.count} tasks ({Math.round(s.pct)}%)</span>
                  </div>
                  <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Effort Allocation by Team Member */}
          <div className="border-t border-zinc-800/80 pt-4 space-y-3">
            <h3 className="text-xs text-zinc-400 font-semibold">Team Allocation (Hours)</h3>
            <div className="space-y-3">
              {users.map((user) => {
                const uTasks = tasks.filter(t => t.assigneeId === user.id);
                const uHours = uTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
                const percent = totalHours > 0 ? (uHours / totalHours) * 100 : 0;

                return (
                  <div key={user.id} className="flex items-center gap-3">
                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full border border-zinc-700" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs font-semibold text-zinc-300">
                        <span className="truncate">{user.name.split(' ')[0]}</span>
                        <span>{uHours}h ({uTasks.length} tasks)</span>
                      </div>
                      <div className="w-full bg-zinc-950 rounded-full h-1.5 mt-1">
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
