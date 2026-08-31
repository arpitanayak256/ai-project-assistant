'use client';

import React, { useState } from 'react';
import { Project, Task, Epic, TaskDependency } from '../types';
import { Calendar, GitCommit, ArrowRight, HelpCircle, Sparkles } from 'lucide-react';

interface TimelineViewProps {
  project: Project;
  tasks: Task[];
  epics: Epic[];
  dependencies: TaskDependency[];
  onSelectTask: (taskId: string) => void;
}

export default function TimelineView({
  project,
  tasks,
  epics,
  dependencies,
  onSelectTask,
}: TimelineViewProps) {
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  const projectTasks = tasks.filter(t => t.projectId === project.id);

  // Map tasks to weeks (Week 1, 2, 3, 4) for visualization.
  // We can assign tasks to weeks based on their creation dates/index/dependency chains.
  // To make it look perfect, let's map them deterministically:
  const getTaskWeekSpan = (task: Task, idx: number) => {
    // Check if task has dependencies. If yes, push it to later weeks.
    const taskDeps = dependencies.filter(d => d.taskId === task.id);
    const isDependent = taskDeps.length > 0;

    let startWeek = 1;
    let spanWeeks = 1;

    if (task.priority === 'URGENT') {
      startWeek = 1;
      spanWeeks = 1;
    } else if (task.priority === 'HIGH') {
      startWeek = isDependent ? 2 : 1;
      spanWeeks = 2;
    } else if (task.priority === 'MEDIUM') {
      startWeek = isDependent ? 3 : 2;
      spanWeeks = 1;
    } else {
      startWeek = 3;
      spanWeeks = 2;
    }

    // Cap values
    if (startWeek > 4) startWeek = 3;
    if (startWeek + spanWeeks > 5) spanWeeks = 5 - startWeek;

    return { startWeek, spanWeeks };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'from-red-600 to-red-500 shadow-red-500/10';
      case 'HIGH': return 'from-orange-600 to-orange-500 shadow-orange-500/10';
      case 'MEDIUM': return 'from-yellow-600 to-yellow-500 shadow-yellow-500/10';
      case 'LOW': return 'from-blue-600 to-blue-500 shadow-blue-500/10';
      default: return 'from-zinc-650 to-zinc-550';
    }
  };

  return (
    <div className="space-y-4">
      {/* Legend & Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/30 border border-zinc-800/80 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span className="text-xs text-zinc-300 font-semibold">Suggested 4-Week Execution Schedule</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500" /> Urgent</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-orange-500" /> High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-500" /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500" /> Low</span>
        </div>
      </div>

      {/* Main Gantt Grid Container */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden p-6 relative">
        {/* Timeline Table Grid Columns */}
        <div className="grid grid-cols-12 gap-0 border-b border-zinc-800 pb-3 font-semibold text-[10px] text-zinc-500 uppercase text-center">
          <div className="col-span-4 text-left pl-2">Task Details</div>
          <div className="col-span-2 border-l border-zinc-850">Week 1</div>
          <div className="col-span-2 border-l border-zinc-850">Week 2</div>
          <div className="col-span-2 border-l border-zinc-850">Week 3</div>
          <div className="col-span-2 border-l border-zinc-850">Week 4</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-zinc-900 pt-3 relative min-h-[300px]">
          {projectTasks.length === 0 ? (
            <div className="text-[11px] text-zinc-600 text-center py-20">
              No tasks available. Use the Requirement Planner to generate tasks.
            </div>
          ) : (
            projectTasks.map((task, idx) => {
              const { startWeek, spanWeeks } = getTaskWeekSpan(task, idx);
              const epic = epics.find(e => e.id === task.epicId);

              // Dependency checks for highlight
              const taskDeps = dependencies.filter(d => d.taskId === task.id);
              const isBlockingOther = dependencies.some(d => d.dependsOnTaskId === task.id);
              const isHovered = hoveredTaskId === task.id;

              // Check if currently hovered task blocks this, or if this blocks hovered task
              const isPredecessorOfHovered = hoveredTaskId
                ? dependencies.some(d => d.taskId === hoveredTaskId && d.dependsOnTaskId === task.id)
                : false;
              const isSuccessorOfHovered = hoveredTaskId
                ? dependencies.some(d => d.taskId === task.id && d.dependsOnTaskId === hoveredTaskId)
                : false;

              // Calculate grid columns: Week 1 is col-5/6, Week 2 is col-7/8, Week 3 is col-9/10, Week 4 is col-11/12
              // startWeek = 1 -> start index = 5, startWeek = 2 -> start index = 7...
              // spanWeeks = 1 -> spans 2 columns, spanWeeks = 2 -> spans 4 columns...
              const colStart = 4 + (startWeek - 1) * 2 + 1;
              const colSpan = spanWeeks * 2;

              return (
                <div
                  key={task.id}
                  onMouseEnter={() => setHoveredTaskId(task.id)}
                  onMouseLeave={() => setHoveredTaskId(null)}
                  className={`grid grid-cols-12 items-center py-3.5 transition-all relative ${
                    isHovered
                      ? 'bg-zinc-900/30'
                      : isPredecessorOfHovered
                      ? 'bg-indigo-950/10'
                      : isSuccessorOfHovered
                      ? 'bg-amber-950/10'
                      : ''
                  }`}
                >
                  {/* Task details block */}
                  <div
                    onClick={() => onSelectTask(task.id)}
                    className="col-span-4 pl-2 min-w-0 cursor-pointer group"
                  >
                    <span className="text-[10px] font-bold text-indigo-400 block mb-0.5 truncate uppercase">
                      {epic ? epic.title : 'General'}
                    </span>
                    <h4 className="text-[11px] font-bold text-zinc-350 line-clamp-1 group-hover:text-indigo-300 transition-colors">
                      {task.title}
                    </h4>
                    {taskDeps.length > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[8px] text-amber-500 font-bold uppercase mt-1">
                        <GitCommit className="w-2.5 h-2.5" /> Blocked by {taskDeps.length} task{taskDeps.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Gantt block element */}
                  <div
                    style={{ gridColumnStart: colStart, gridColumnEnd: colStart + colSpan }}
                    className="h-7.5 relative flex items-center pr-2"
                  >
                    <div
                      onClick={() => onSelectTask(task.id)}
                      className={`w-full h-5 rounded-lg bg-gradient-to-r ${getPriorityColor(task.priority)} shadow-md flex items-center justify-between px-3 cursor-pointer group-hover:scale-[1.01] transition-transform relative border border-white/5`}
                    >
                      <span className="text-[8px] font-bold text-white tracking-wide uppercase">
                        {task.estimatedHours}h
                      </span>

                      {/* Highlight border on dependencies */}
                      {(isHovered || isPredecessorOfHovered || isSuccessorOfHovered) && (
                        <div className={`absolute inset-0 rounded-lg border-2 ${
                          isHovered
                            ? 'border-indigo-400 scale-[1.02]'
                            : isPredecessorOfHovered
                            ? 'border-indigo-500/80 scale-[1.01]'
                            : 'border-amber-500/80 scale-[1.01]'
                        } pointer-events-none`} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Dependency Tip Footer */}
      {hoveredTaskId && (
        <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl flex items-center gap-2.5 text-[10px] text-zinc-400 animate-fade-in">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            Hovering <strong>"{tasks.find(t => t.id === hoveredTaskId)?.title}"</strong>.{' '}
            {dependencies.some(d => d.taskId === hoveredTaskId) && (
              <span>
                Highlighted in <span className="text-indigo-400 font-bold border-b border-indigo-500/30">Indigo</span> are the tasks blocking this card.
              </span>
            )}{' '}
            {dependencies.some(d => d.dependsOnTaskId === hoveredTaskId) && (
              <span>
                Highlighted in <span className="text-amber-400 font-bold border-b border-amber-500/30">Amber</span> are tasks blocked by this card.
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
