'use client';

import React from 'react';
import { Project, Task, Epic, User, ProjectHealth } from '../types';
import { Activity, ShieldAlert, CheckCircle, Clock, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

interface HealthViewProps {
  project: Project;
  tasks: Task[];
  users: User[];
  health: ProjectHealth;
  onApplyRecommendation: (actionType: string, payload: any) => void;
}

export default function HealthView({
  project,
  tasks,
  users,
  health,
  onApplyRecommendation,
}: HealthViewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/20';
    if (score >= 60) return 'text-amber-400 border-amber-500/20';
    return 'text-red-400 border-red-500/20';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Health Score Radial Meter & Basic Metrics */}
      <div className="space-y-4">
        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
          <h3 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-6">AI Health Score</h3>

          {/* Radial Meter */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle
                className="text-zinc-850"
                strokeWidth="2.5"
                stroke="currentColor"
                fill="none"
                cx="18"
                cy="18"
                r="15.915"
              />
              <circle
                className={getScoreColor(health.score).split(' ')[0]}
                strokeDasharray={`${health.score}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                cx="18"
                cy="18"
                r="15.915"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-4xl font-extrabold tracking-tight ${getScoreColor(health.score).split(' ')[0]}`}>
                {health.score}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-500 font-semibold uppercase mt-0.5">Rating</span>
            </div>
          </div>

          <div className="mt-6 space-y-1">
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {health.score >= 80 ? 'Optimal Performance' : health.score >= 60 ? 'Moderate Alert' : 'Critical Bottleneck'}
            </h4>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-500 max-w-xs leading-normal">
              Based on completion velocities, developer workload balance, and task dependencies.
            </p>
          </div>
        </div>

        {/* Quick health metrics panel */}
        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-3">
          <div className="flex justify-between items-center text-xs font-medium border-b border-zinc-200 dark:border-zinc-850 pb-2.5">
            <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> Completed Tasks</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-bold">{health.completedTasks} / {health.totalTasks}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-medium border-b border-zinc-200 dark:border-zinc-850 pb-2.5">
            <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-400" /> Overdue Deliverables</span>
            <span className={`font-bold ${health.overdueTasks > 0 ? 'text-red-400' : 'text-zinc-600 dark:text-zinc-400'}`}>{health.overdueTasks}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-medium">
            <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-amber-400" /> Blocked Tasks</span>
            <span className={`font-bold ${health.blockedTasks > 0 ? 'text-amber-400' : 'text-zinc-600 dark:text-zinc-400'}`}>{health.blockedTasks}</span>
          </div>
        </div>
      </div>

      {/* Middle & Right Column: Diagnostics and Actionable Recommendations */}
      <div className="lg:col-span-2 space-y-6">
        {/* Diagnostic Insights */}
        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-400" /> Health Diagnostics Insights
          </h3>

          <div className="space-y-3">
            {health.aiInsights.map((insight, idx) => (
              <div key={idx} className="flex gap-3 p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <span className="text-amber-400 font-bold">⚠️</span>
                <span>{insight}</span>
              </div>
            ))}
            {health.aiInsights.length === 0 && (
              <div className="text-center py-6 text-zinc-650 text-xs">
                No diagnostic alerts found. Project parameters are fully aligned!
              </div>
            )}
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" /> AI Recommendations
          </h3>

          <div className="space-y-3">
            {health.aiRecommendations.map((rec, idx) => {
              // Custom interactive trigger mapping
              let actionType = '';
              let btnText = 'Apply Recommendation';
              let payload: any = {};

              if (rec.includes('Reassign') || rec.includes('Alex')) {
                actionType = 'REASSIGN';
                btnText = 'Reassign to David PM';
                const targetTask = tasks.find(t => t.projectId === project.id && t.status !== 'DONE' && t.assigneeId === 'user-current');
                payload = { taskId: targetTask?.id, newAssigneeId: 'user-pm' };
              } else if (rec.includes('deadline') || rec.includes('sprint')) {
                actionType = 'EXTEND_DEADLINE';
                btnText = 'Extend Sprint Deadline';
                payload = { projectId: project.id };
              }

              return (
                <div key={idx} className="p-4 rounded-xl bg-indigo-950/15 border border-indigo-900/30 space-y-3 flex flex-col justify-between">
                  <div className="flex gap-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">{rec}</p>
                  </div>
                  {actionType && (
                    <button
                      onClick={() => onApplyRecommendation(actionType, payload)}
                      className="self-end bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-0.5 transition-all active:scale-[0.98]"
                    >
                      {btnText} <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
            {health.aiRecommendations.length === 0 && (
              <div className="text-center py-6 text-zinc-650 text-xs">
                All optimization metrics are optimal. No suggestions needed!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
