'use client';

import React, { useState, useEffect } from 'react';
import { Project, Epic, Task, Subtask, TaskDependency, User, TaskStatus, ProjectHealth } from './types';
import {
  mockUsers,
  mockProjects,
  mockEpics,
  mockTasks,
  mockSubtasks,
  mockDependencies,
  GenerationResult,
} from './mockInitialData';

// Component Imports
import AuthModal from './components/AuthModal';
import DashboardView from './components/DashboardView';
import PlannerView from './components/PlannerView';
import BoardView from './components/BoardView';
import ListView from './components/ListView';
import TimelineView from './components/TimelineView';
import ChatView from './components/ChatView';
import HealthView from './components/HealthView';
import TaskModal from './components/TaskModal';
import { ThemeToggle } from './components/ThemeToggle';

// Icons
import {
  LayoutDashboard,
  Sparkles,
  KanbanSquare,
  Layers,
  CalendarDays,
  MessageCircle,
  Activity,
  LogOut,
  FolderKanban,
  CheckCircle2,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';

import { useProjects } from '../hooks';

export default function Home() {
  const { fetchFullProjects } = useProjects();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Main Database States
  const [projects, setProjects] = useState<Project[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      const data = await fetchFullProjects();
      const { projects: fetchedProjects, dependencies: fetchedDeps } = data;
      
      setProjects(fetchedProjects.map((p: any) => ({ ...p, status: p.status as any })));
      
      const allEpics = fetchedProjects.flatMap((p: any) => p.epics || []);
      setEpics(allEpics);
      
      const allTasks = fetchedProjects.flatMap((p: any) => p.tasks || []);
      setTasks(allTasks);
      
      setDependencies(fetchedDeps);
    } catch (error) {
      console.error('Failed to fetch projects from backend:', error);
    }
  };

  // Fetch projects from PostgreSQL Backend
  useEffect(() => {
    loadProjects();

    // Auth Check
    const storedUser = localStorage.getItem('assistant_current_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // Set default project ID once projects are loaded
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('assistant_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('assistant_current_user');
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  // --- Dynamic AI Project Health Analysis Engine ---
  const getProjectHealth = (projectId: string): ProjectHealth => {
    const pTasks = tasks.filter((t) => t.projectId === projectId);
    const completedCount = pTasks.filter((t) => t.status === 'DONE').length;
    const totalCount = pTasks.length;

    if (totalCount === 0) {
      return {
        score: 100,
        completedTasks: 0,
        totalTasks: 0,
        overdueTasks: 0,
        blockedTasks: 0,
        workloadDistribution: [],
        aiInsights: [],
        aiRecommendations: [],
      };
    }

    let score = 100;
    const insights: string[] = [];
    const recommendations: string[] = [];

    // 1. Completion Rate Score factor
    const completionRate = completedCount / totalCount;
    // Low completion score penalty if early days
    if (completionRate < 0.2) {
      score -= 10;
      insights.push('Project in initiation phase. Completion velocity is currently below 20%.');
    }

    // 2. Overdue Deliverables Factor
    const todayStr = new Date().toISOString().split('T')[0];
    const overdueList = pTasks.filter(
      (t) => t.status !== 'DONE' && t.dueDate && t.dueDate < todayStr
    );
    if (overdueList.length > 0) {
      score -= overdueList.length * 6;
      insights.push(`Found ${overdueList.length} overdue task(s) past schedule deadlines.`);
      recommendations.push(
        `Review and extend delivery deadlines for overdue items: "${overdueList[0].title}"`
      );
    }

    // 3. Blocked Deliverables (Unresolved prerequisites)
    const blockedList = pTasks.filter((task) => {
      if (task.status === 'DONE') return false;
      const taskDeps = dependencies.filter((d) => d.taskId === task.id);
      return taskDeps.some((dep) => {
        const prereq = tasks.find((t) => t.id === dep.dependsOnTaskId);
        return prereq && prereq.status !== 'DONE';
      });
    });

    if (blockedList.length > 0) {
      score -= blockedList.length * 8;
      insights.push(`${blockedList.length} task(s) currently blocked by prerequisite tasks.`);
      const blockerTaskIds = dependencies
        .filter((d) => blockedList.some((bt) => bt.id === d.taskId))
        .map((d) => d.dependsOnTaskId);
      const blockerTasks = tasks.filter((t) => blockerTaskIds.includes(t.id) && t.status !== 'DONE');

      if (blockerTasks.length > 0) {
        recommendations.push(
          `Prioritize resource efforts on blocker prerequisite task: "${blockerTasks[0].title}"`
        );
      }
    }

    // 4. Developer Workload Overload Check
    const workload: { assigneeName: string; taskCount: number; hours: number }[] = [];
    mockUsers.forEach((u) => {
      const uTasks = pTasks.filter((t) => t.assigneeId === u.id && t.status !== 'DONE');
      const hours = uTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
      workload.push({ assigneeName: u.name, taskCount: uTasks.length, hours });

      // Overload check: > 16 hours of URGENT/HIGH workload
      const urgentHours = uTasks
        .filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH')
        .reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

      if (urgentHours > 16) {
        score -= 12;
        insights.push(`Resource Overload: ${u.name} is overallocated with ${urgentHours}h of Urgent tasks.`);
        recommendations.push(
          `Reassign one or more high-priority items from ${u.name.split(' ')[0]} to David PM to rebalance sprints.`
        );
      }
    });

    // Clamp score
    score = Math.max(Math.min(score, 100), 10);

    return {
      score,
      completedTasks: completedCount,
      totalTasks: totalCount,
      overdueTasks: overdueList.length,
      blockedTasks: blockedList.length,
      workloadDistribution: workload,
      aiInsights: insights,
      aiRecommendations: recommendations,
    };
  };

  // State manipulation Handlers
  const handleAddTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: Task = {
      ...newTask,
      id: 'task-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, task]);
  };

  const handleAddEpic = (newEpic: Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>) => {
    const epic: Epic = {
      ...newEpic,
      id: 'epic-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEpics((prev) => [...prev, epic]);
  };

  const handleUpdateEpic = (updatedEpic: Epic) => {
    setEpics((prev) => prev.map((e) => (e.id === updatedEpic.id ? updatedEpic : e)));
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t))
    );
  };

  const handleAddSubtask = (newSub: Omit<Subtask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const sub: Subtask = {
      ...newSub,
      id: 'sub-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSubtasks((prev) => [...prev, sub]);
  };

  const handleToggleSubtask = (subId: string, completed: boolean) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, completed, updatedAt: new Date().toISOString() } : s))
    );
  };

  const handleDeleteSubtask = (subId: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== subId));
  };

  // simulated AI subtask breakdown generator
  const handleGenerateSubtasks = (taskId: string, title: string) => {
    const titleLower = title.toLowerCase();
    let subtasksToAdd: string[] = [];

    if (titleLower.includes('db') || titleLower.includes('database') || titleLower.includes('schema')) {
      subtasksToAdd = [
        'Design database relations and entity schema parameters',
        'Create prisma.schema models and constraints',
        'Run initial seed migrations to verify key integrity',
        'Write Unit/Integration testing scripts for database queries',
      ];
    } else if (titleLower.includes('auth') || titleLower.includes('jwt') || titleLower.includes('login')) {
      subtasksToAdd = [
        'Integrate passport JWT validation strategy routines',
        'Build login, logout, and token sign-in HTTP endpoints',
        'Set up access token refresh loops and cookie storage',
        'Create validation forms and error displays on frontend',
      ];
    } else if (titleLower.includes('builder') || titleLower.includes('form') || titleLower.includes('ui')) {
      subtasksToAdd = [
        'Draft wireframes and modular layouts for builder layout',
        'Validate form attributes and field limits',
        'Bind form parameters to browser localStorage drafts',
        'Write submission APIs call handlers',
      ];
    } else {
      subtasksToAdd = [
        'Conduct technical design review with co-developer',
        'Write backend services, router interfaces and classes',
        'Connect user feedback components and style screens',
        'Perform unit tests and verify code rules linting',
      ];
    }

    const generated: Subtask[] = subtasksToAdd.map((sTitle, idx) => ({
      id: `sub-gen-${Date.now()}-${idx}`,
      taskId,
      title: sTitle,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    setSubtasks((prev) => [...prev, ...generated]);
  };

  // AI Recommendation Executions
  const handleApplyRecommendation = (actionType: string, payload: any) => {
    if (actionType === 'REASSIGN') {
      const { taskId, newAssigneeId } = payload;
      if (!taskId) return;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                assigneeId: newAssigneeId,
                aiExplanation: 'Task reallocated to David PM by AI Optimizer recommendation to balance developer workloads.',
              }
            : t
        )
      );
    } else if (actionType === 'EXTEND_DEADLINE') {
      const { projectId } = payload;
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // extend 14 days
              }
            : p
        )
      );
    }
  };

  // AI project generator handler
  const handleProjectImported = async () => {
    await loadProjects();
    setCurrentView('dashboard');
  };

  // If not logged in, render the login flow page
  if (!currentUser) {
    return <AuthModal onLogin={handleLogin} />;
  }

  const projectHealth = activeProject ? getProjectHealth(activeProject.id) : null;

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-zinc-50 dark:bg-zinc-900/80 border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col justify-between shrink-0 relative z-20">
        <div className="flex-1 flex flex-col min-h-0 pt-5">
          {/* Logo Brand */}
          <div className="px-5 pb-5 border-b border-zinc-200 dark:border-zinc-800/60 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-indigo-600/10">
              C
            </div>
            <div>
              <span className="font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-300 dark:via-violet-300 dark:to-purple-300 bg-clip-text text-transparent block text-sm">
                Clutch AI
              </span>
              <span className="text-[9px] text-zinc-500 dark:text-zinc-500 font-semibold block uppercase tracking-wider">
                Project Assistant
              </span>
            </div>
          </div>

          {/* Active Workspace Selector */}
          <div className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-850">
            <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider block px-1.5 mb-1.5">
              Active Project Workspace
            </span>
            <div className="relative">
              <FolderKanban className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 shrink-0" />
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'planner', label: 'AI Requirement Planner', icon: Sparkles, highlight: true },
              { id: 'board', label: 'Kanban Board', icon: KanbanSquare },
              { id: 'list', label: 'Epic List View', icon: Layers },
              { id: 'chat', label: 'AI Project Chat', icon: MessageCircle },
              { id: 'health', label: 'Workspace Health', icon: Activity, badge: projectHealth?.score },
            ].map((link) => {
              const Icon = link.icon;
              const isActive = currentView === link.id;

              return (
                <button
                  key={link.id}
                  onClick={() => setCurrentView(link.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                      : link.highlight
                      ? 'text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:bg-zinc-900 hover:text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                        link.badge >= 80
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : link.badge >= 60
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {link.badge}%
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Sign Out */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-950/20 shrink-0">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-850">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-850 shrink-0"
              />
              <div className="min-w-0">
                <span className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 truncate">
                  {currentUser.name}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 hover:bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 hover:text-red-400 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-white dark:bg-zinc-950">
        {/* Top bar header */}
        <header className="h-14 border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950/40 flex items-center justify-between px-6 shrink-0 relative z-10">
          {/* Breadcrumb path */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-500 font-semibold select-none">
            <span>Workspace</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-600 dark:text-zinc-400 font-bold truncate max-w-[150px]">
              {activeProject ? activeProject.name : 'Selection'}
            </span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-800 dark:text-zinc-200 capitalize font-bold">{currentView}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Status light */}
            {activeProject && (
              <span className="text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> Sprints Active
              </span>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* Scrollable View Content */}
        <div className="flex-1 overflow-y-auto p-6 relative z-1">
          {/* Neon background light spots */}
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

          {/* View Router Renderings */}
          {currentView === 'dashboard' && (
            <DashboardView
              projects={projects}
              tasks={tasks}
              epics={epics}
              users={mockUsers}
              onSelectProject={setSelectedProjectId}
              onNavigateToView={setCurrentView}
              getProjectHealth={getProjectHealth}
            />
          )}

          {currentView === 'planner' && <PlannerView onProjectImported={handleProjectImported} />}

          {currentView === 'board' && activeProject && (
            <BoardView
              project={activeProject}
              tasks={tasks}
              epics={epics}
              users={mockUsers}
              subtasks={subtasks}
              onSelectTask={setSelectedTaskId}
              onAddTask={handleAddTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
            />
          )}

          {currentView === 'list' && activeProject && (
            <ListView
              project={activeProject}
              tasks={tasks}
              epics={epics}
              users={mockUsers}
              onSelectTask={setSelectedTaskId}
              onAddEpic={handleAddEpic}
              onUpdateEpic={handleUpdateEpic}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
            />
          )}

          {currentView === 'chat' && activeProject && (
            <ChatView
              project={activeProject}
              tasks={tasks}
              epics={epics}
              dependencies={dependencies}
              users={mockUsers}
              currentUser={currentUser}
            />
          )}

          {currentView === 'health' && activeProject && projectHealth && (
            <HealthView
              project={activeProject}
              tasks={tasks}
              users={mockUsers}
              health={projectHealth}
              onApplyRecommendation={handleApplyRecommendation}
            />
          )}
        </div>

        {/* Task Detail Slider/Modal */}
        {selectedTaskId && (
          <TaskModal
            task={tasks.find((t) => t.id === selectedTaskId)!}
            epics={epics}
            users={mockUsers}
            subtasks={subtasks}
            onClose={() => setSelectedTaskId(null)}
            onUpdateTask={handleUpdateTask}
            onAddSubtask={handleAddSubtask}
            onToggleSubtask={handleToggleSubtask}
            onDeleteSubtask={handleDeleteSubtask}
            onGenerateSubtasks={handleGenerateSubtasks}
          />
        )}
      </main>
    </div>
  );
}
