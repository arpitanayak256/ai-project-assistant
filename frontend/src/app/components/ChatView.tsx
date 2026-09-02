'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Project, Task, Epic, TaskDependency, User, AIMessage } from '../types';
import { Send, Sparkles, Terminal, ShieldAlert, Cpu } from 'lucide-react';

interface ChatViewProps {
  project: Project;
  tasks: Task[];
  epics: Epic[];
  dependencies: TaskDependency[];
  users: User[];
  currentUser: User;
}

export default function ChatView({
  project,
  tasks,
  epics,
  dependencies,
  users,
  currentUser,
}: ChatViewProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const projectEpics = epics.filter(e => e.projectId === project.id);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'msg-welcome',
        conversationId: 'conv-default',
        role: 'ASSISTANT',
        content: `Hi ${currentUser.name.split(' ')[0]}! I'm your AI Project Assistant. I have indexed the project details, including **${projectEpics.length} epics** and **${projectTasks.length} tasks** for **${project.name}**. 

You can ask me questions such as:
- *What should I work on next?*
- *Which tasks are blocking development?*
- *Explain this project to a new developer.*
- *Evaluate our project health and list bottleneck tasks.*`,
        createdAt: new Date().toISOString(),
      }
    ]);
  }, [project.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: AIMessage = {
      id: 'msg-user-' + Date.now(),
      conversationId: 'conv-default',
      role: 'USER',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response based on real-time task analysis
    setTimeout(() => {
      let responseContent = '';
      const promptLower = text.toLowerCase();

      if (promptLower.includes('work on next') || promptLower.includes('my next task')) {
        // AI query: "What should I work on next?"
        const incompleteTasks = projectTasks.filter(t => t.status !== 'DONE' && t.assigneeId === currentUser.id);
        const unassignedIncomplete = projectTasks.filter(t => t.status !== 'DONE' && !t.assigneeId);

        const priorityWeight = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        const sortTasks = (a: Task, b: Task) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);

        const sortedMyTasks = [...incompleteTasks].sort(sortTasks);
        const sortedUnassigned = [...unassignedIncomplete].sort(sortTasks);

        if (sortedMyTasks.length > 0) {
          responseContent = `Based on your assigned workload, here are the highest priority items you should work on next:

1. **${sortedMyTasks[0].title}** (Priority: **${sortedMyTasks[0].priority}**, Estimate: **${sortedMyTasks[0].estimatedHours}h**)
   *Status: ${sortedMyTasks[0].status}* - ${sortedMyTasks[0].description}
${
  sortedMyTasks[1]
    ? `2. **${sortedMyTasks[1].title}** (Priority: **${sortedMyTasks[1].priority}**, Estimate: **${sortedMyTasks[1].estimatedHours}h**)`
    : ''
}

Please make sure to update the task status to **In Progress** in the Kanban board when you start.`;
        } else if (sortedUnassigned.length > 0) {
          responseContent = `You currently have no tasks in progress! However, there are several unassigned backlog tasks available. I recommend picking up:

1. **${sortedUnassigned[0].title}** (Priority: **${sortedUnassigned[0].priority}**, Estimate: **${sortedUnassigned[0].estimatedHours}h**)
   *Epic: ${epics.find(e => e.id === sortedUnassigned[0].epicId)?.title || 'General'}*
${
  sortedUnassigned[1]
    ? `2. **${sortedUnassigned[1].title}** (Priority: **${sortedUnassigned[1].priority}**, Estimate: **${sortedUnassigned[1].estimatedHours}h**)`
    : ''
}

Would you like me to assign the top task to you?`;
        } else {
          responseContent = `Great news! All tasks in this project are either completed or in review. You have no pending items. 

Perhaps you should check in with the team or use the **Requirement Planner** to suggest subsequent features.`;
        }

      } else if (promptLower.includes('block') || promptLower.includes('dependency')) {
        // AI query: "Which tasks are blocking?"
        // Find tasks that are depended on by other tasks and NOT complete
        const activeDependencies = dependencies.filter(dep => {
          const dependentTask = projectTasks.find(t => t.id === dep.taskId);
          const prerequisiteTask = projectTasks.find(t => t.id === dep.dependsOnTaskId);
          return dependentTask && prerequisiteTask && prerequisiteTask.status !== 'DONE';
        });

        if (activeDependencies.length > 0) {
          // Group by prerequisite task
          const blockers: Record<string, string[]> = {};
          activeDependencies.forEach(dep => {
            if (!blockers[dep.dependsOnTaskId]) blockers[dep.dependsOnTaskId] = [];
            const depTaskName = projectTasks.find(t => t.id === dep.taskId)?.title || 'Unknown Task';
            blockers[dep.dependsOnTaskId].push(depTaskName);
          });

          responseContent = `Here are the active blocking bottlenecks in your project pipeline:

${Object.entries(blockers).map(([blockerId, blockedTasksList], idx) => {
  const blockerTask = projectTasks.find(t => t.id === blockerId)!;
  const assigneeName = users.find(u => u.id === blockerTask.assigneeId)?.name || 'Unassigned';
  return `${idx + 1}. **${blockerTask.title}** (Prerequisite)
   * Status: **${blockerTask.status}** | Assignee: **${assigneeName}**
   * *Blocking:* ${blockedTasksList.map(t => `"${t}"`).join(', ')}`;
}).join('\n\n')}

Recommend focusing resource efforts to resolve these blocker tasks first to unblock dependent streams.`;
        } else {
          responseContent = `There are currently **no active blocking dependencies** in this project! All tasks are clear to be worked on in parallel.`;
        }

      } else if (promptLower.includes('explain') || promptLower.includes('new developer')) {
        // AI query: "Explain this project to a new developer."
        responseContent = `Welcome to the team! Here is the architecture overview of **${project.name}**:

### Project Purpose
${project.description}

### Project Layout (${projectEpics.length} Epics)
Here are the functional modules:
${projectEpics.map(e => `- **${e.title}**: ${e.description}`).join('\n')}

### Development Progress
- Total Scope: **${projectTasks.length} tasks**
- Completed tasks: **${projectTasks.filter(t => t.status === 'DONE').length}**
- In progress: **${projectTasks.filter(t => t.status === 'IN_PROGRESS').length}**

I suggest checking the **Kanban Board** and looking at unassigned **To Do** tasks under Phase 1 (Authentication) to get your local environment set up.`;

      } else if (promptLower.includes('health') || promptLower.includes('diagnose') || promptLower.includes('bottleneck')) {
        // AI query: "Evaluate health"
        const completedCount = projectTasks.filter(t => t.status === 'DONE').length;
        const healthPercent = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0;
        const urgentPending = projectTasks.filter(t => t.status !== 'DONE' && t.priority === 'URGENT').length;

        responseContent = `### Project Health Diagnostics Summary

- **Health Score**: **${healthPercent >= 75 ? 'Good' : healthPercent >= 50 ? 'Fair' : 'Risk'}** (${healthPercent}% tasks complete)
- **Urgent Backlog**: **${urgentPending} urgent tasks** currently outstanding.

#### Bottlenecks Identified:
${
  urgentPending > 0
    ? `1. ⚠️ **Pending Urgent Items**: You have ${urgentPending} urgent task(s) in progress/todo. This delays critical deliverables.`
    : '1. ✓ **Priority Alignment**: No critical backlog items outstanding.'
}
2. 👥 **Workload Distribution**:
   - Alex Developer: ${projectTasks.filter(t => t.assigneeId === 'user-current').length} tasks
   - Sarah Engineer: ${projectTasks.filter(t => t.assigneeId === 'user-co-dev').length} tasks
   - David PM: ${projectTasks.filter(t => t.assigneeId === 'user-pm').length} tasks

Would you like me to recommend a re-allocation strategy?`;

      } else {
        // Fallback generic AI response
        responseContent = `I understand you are asking about: "${text}". 

As an AI specialized in project analysis, I can help you manage requirements, tasks, and dependencies. If you would like to run diagnostic evaluations, please use one of our quick tags below, or ask me for details on specific tasks in the **${project.name}** workspace.`;
      }

      const aiMessage: AIMessage = {
        id: 'msg-ai-' + Date.now(),
        conversationId: 'conv-default',
        role: 'ASSISTANT',
        content: responseContent,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl h-[560px] flex flex-col justify-between overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">AI Contextual Co-Pilot</span>
            <span className="text-[9px] text-emerald-400 block font-semibold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Online & Indexed
            </span>
          </div>
        </div>
      </div>

      {/* Messages Pane */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isAI = msg.role === 'ASSISTANT';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${isAI ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                isAI ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 font-bold text-xs' : 'border-zinc-200 dark:border-zinc-800'
              }`}>
                {isAI ? 'AI' : <img src={currentUser.avatarUrl} className="w-full h-full rounded-full" />}
              </div>

              {/* Message Bubble */}
              <div className={`p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                isAI
                  ? 'bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 text-zinc-350 rounded-tl-sm'
                  : 'bg-indigo-600 text-white rounded-tr-sm shadow-lg shadow-indigo-600/10'
              }`}>
                {/* Simulated Markdown renderer */}
                <div className="whitespace-pre-wrap">
                  {msg.content.split('\n').map((line, idx) => {
                    // Render simple lists, headers, and strong markdown on client
                    if (line.startsWith('### ')) {
                      return <h3 key={idx} className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-2 mb-1">{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('#### ')) {
                      return <h4 key={idx} className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 mt-2 mb-1">{line.replace('#### ', '')}</h4>;
                    }
                    if (line.startsWith('- ') || line.startsWith('* ')) {
                      return <li key={idx} className="list-disc pl-4 mt-1 text-zinc-700 dark:text-zinc-300">{line.substring(2)}</li>;
                    }
                    if (line.match(/^\d+\./)) {
                      return <div key={idx} className="pl-4 mt-1 text-zinc-700 dark:text-zinc-300">{line}</div>;
                    }
                    return <p key={idx} className="mt-1">{line}</p>;
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-[80%] self-start animate-pulse">
            <div className="w-8 h-8 rounded-full bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <div className="bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-850 p-3 rounded-2xl flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Tags & Chat Input */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950/20 shrink-0 space-y-3">
        {/* Quick Tags */}
        <div className="flex flex-wrap gap-2">
          {[
            'What should I work on next?',
            'Which tasks are blocking?',
            'Explain project to a new dev',
            'Evaluate project health'
          ].map((tag, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(tag)}
              disabled={isLoading}
              className="text-[10px] font-semibold px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 hover:border-indigo-500/40 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 transition-all disabled:opacity-50"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Chat input box */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
            placeholder={`Ask about tasks or health in "${project.name}"...`}
            className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl px-3.5 py-2 text-xs text-zinc-700 dark:text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-3.5 py-2 flex items-center justify-center transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
