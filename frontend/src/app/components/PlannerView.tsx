'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Terminal, FileText, Send, Layers, GitFork, ArrowRight, Play } from 'lucide-react';
import { promptPresets, GenerationResult } from '../mockInitialData';
import { TaskStatus, TaskPriority } from '../types';

interface PlannerViewProps {
  onGenerateProject: (generation: GenerationResult) => void;
}

export default function PlannerView({ onGenerateProject }: PlannerViewProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState<GenerationResult | null>(null);

  const steps = [
    { title: 'Analyzing Requirements', desc: 'Running NLP parser on unstructured requirements...', icon: Terminal },
    { title: 'Designing Project Architecture', desc: 'Extracting product summary & defining milestones...', icon: FileText },
    { title: 'Drafting Epics & Work Modules', desc: 'Synthesizing epics, categories and subtask outlines...', icon: Layers },
    { title: 'Breaking Down Into Actionable Tasks', desc: 'Formulating task lists, assigning priorities and effort hours...', icon: Send },
    { title: 'Resolving Dependency Network', desc: 'Configuring topological sort for execution timelines...', icon: GitFork }
  ];

  const handleSelectPreset = (presetText: string) => {
    setPrompt(presetText);
    setGeneratedPlan(null);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGenerationStep(0);
    setGeneratedPlan(null);
  };

  // Run generation step animations
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);

          // Find matching preset, or construct a dynamic mock result
          const matchedPreset = promptPresets.find(
            (p) => prompt.toLowerCase().includes(p.title.toLowerCase().substring(0, 5)) ||
                   p.prompt.toLowerCase().includes(prompt.toLowerCase().substring(0, 10))
          ) || promptPresets[0]; // fallback to Exam System if nothing matches

          // If they typed something random, generate custom project details
          let resultPlan = matchedPreset.result;
          if (!promptPresets.some(p => p.prompt === prompt)) {
            const tempTitle = prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt;
            resultPlan = {
              project: {
                name: `Custom: ${tempTitle}`,
                description: `AI-generated project based on requirements: "${prompt}"`,
                status: 'ACTIVE'
              },
              epics: [
                { title: 'Phase 1: Foundation', description: 'Core database, schema design, and basic authentication APIs.' },
                { title: 'Phase 2: Core Functionality', description: 'Primary business logic, views, and custom handlers.' },
                { title: 'Phase 3: Integration & Polish', description: 'Third-party setups, testing pipelines, and layout styles.' }
              ],
              tasks: [
                { epicIndex: 0, title: 'Database schema design and migration config', description: 'Define primary tables and relationships.', status: 'TODO' as TaskStatus, priority: 'URGENT' as TaskPriority, estimatedHours: 8, aiExplanation: 'Standard schema initialization. Estimated 8 hours.' },
                { epicIndex: 0, title: 'User authentication and access permissions API', description: 'Setup registration, session checks.', status: 'TODO' as TaskStatus, priority: 'HIGH' as TaskPriority, estimatedHours: 10, aiExplanation: 'Requires security handlers. Estimated 10 hours.' },
                { epicIndex: 1, title: 'Core dashboard layout and widgets', description: 'Main front-end layout component views.', status: 'TODO' as TaskStatus, priority: 'HIGH' as TaskPriority, estimatedHours: 12, aiExplanation: 'Visual layout components. Estimated 12 hours.' },
                { epicIndex: 1, title: 'Custom search filters and reports', description: 'Database query filters and listings.', status: 'TODO' as TaskStatus, priority: 'MEDIUM' as TaskPriority, estimatedHours: 14, aiExplanation: 'Query sorting, table lists. Estimated 14 hours.' },
                { epicIndex: 2, title: 'Integrate external API integrations', description: 'Connecting core services to external servers.', status: 'TODO' as TaskStatus, priority: 'MEDIUM' as TaskPriority, estimatedHours: 16, aiExplanation: 'Integration testing. Estimated 16 hours.' },
                { epicIndex: 2, title: 'Unit and end-to-end testing', description: 'Verify page loads, edge cases, APIs validation.', status: 'TODO' as TaskStatus, priority: 'LOW' as TaskPriority, estimatedHours: 8, aiExplanation: 'Basic test coverage. Estimated 8 hours.' }
              ],
              dependencies: [
                { taskIndex: 1, dependsOnTaskIndex: 0 },
                { taskIndex: 2, dependsOnTaskIndex: 1 },
                { taskIndex: 3, dependsOnTaskIndex: 2 }
              ]
            };
          }

          setGeneratedPlan(resultPlan);
          setIsGenerating(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isGenerating, prompt]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left Column: Requirements Input */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-200">AI Requirement Planner</h2>
              <p className="text-[10px] text-zinc-500">Provide unstructured specs in natural language</p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your application requirements. (e.g. 'I need to build an online examination system. Admin should create exams, add questions, schedule shifts, students should register and receive results...')"
                className="w-full h-44 bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 leading-relaxed resize-none"
                disabled={isGenerating}
              />
              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="absolute right-3 bottom-3 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </form>

          {/* Quick Presets */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Or select a pre-defined MVP document:</span>
            <div className="space-y-2">
              {promptPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset.prompt)}
                  disabled={isGenerating}
                  className={`w-full text-left p-3 rounded-xl border text-[11px] leading-relaxed transition-all flex justify-between items-center gap-2 ${
                    prompt === preset.prompt
                      ? 'bg-indigo-500/5 border-indigo-500/40 text-indigo-300 font-semibold'
                      : 'bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="block font-bold truncate">{preset.title}</span>
                    <span className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{preset.prompt}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Execution Output */}
      <div className="lg:col-span-3">
        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl h-full flex flex-col min-h-[400px] justify-between relative overflow-hidden">
          {/* Background grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e1e2e_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

          {isGenerating ? (
            /* Generating State */
            <div className="flex-1 flex flex-col justify-center items-center py-8 space-y-8 relative z-10">
              <div className="relative w-20 h-20">
                {/* Glowing ring */}
                <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-2 border border-violet-500/20 rounded-full flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
              </div>

              <div className="space-y-4 w-full max-w-sm">
                <h3 className="text-center font-bold text-sm text-zinc-200">AI Plan Orchestrator</h3>
                <div className="space-y-2.5">
                  {steps.map((step, idx) => {
                    const StepIcon = step.icon;
                    let state: 'todo' | 'active' | 'done' = 'todo';
                    if (idx < generationStep) state = 'done';
                    else if (idx === generationStep) state = 'active';

                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-300 ${
                          state === 'done'
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                            : state === 'active'
                            ? 'bg-indigo-500/5 border-indigo-500/30 text-indigo-400 scale-[1.01] shadow-lg shadow-indigo-500/5'
                            : 'border-transparent text-zinc-600'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg border ${
                          state === 'done'
                            ? 'bg-emerald-500/10 border-emerald-500/20'
                            : state === 'active'
                            ? 'bg-indigo-500/10 border-indigo-500/20 animate-pulse'
                            : 'bg-zinc-950 border-zinc-800'
                        }`}>
                          <StepIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-[11px] font-bold">{step.title}</span>
                          {state === 'active' && (
                            <span className="text-[9px] text-indigo-300/80 block mt-0.5 truncate animate-pulse">
                              {step.desc}
                            </span>
                          )}
                        </div>
                        {state === 'done' && (
                          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[9px] font-bold text-emerald-400">✓</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : generatedPlan ? (
            /* Project Plan Ready State */
            <div className="flex-1 flex flex-col justify-between py-2 relative z-10 animate-fade-in">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold px-2 py-1 rounded-lg border border-emerald-500/20 bg-emerald-500/5 self-start">
                  ✓ AI Generation Complete
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-zinc-100">{generatedPlan.project.name}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{generatedPlan.project.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 border-y border-zinc-800/80 py-4">
                  <div className="text-center space-y-0.5">
                    <span className="text-[10px] text-zinc-500 block">Total Epics</span>
                    <span className="text-sm font-bold text-zinc-300">{generatedPlan.epics.length}</span>
                  </div>
                  <div className="text-center space-y-0.5 border-x border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 block">Task Breakdown</span>
                    <span className="text-sm font-bold text-zinc-300">{generatedPlan.tasks.length} items</span>
                  </div>
                  <div className="text-center space-y-0.5">
                    <span className="text-[10px] text-zinc-500 block">Total Effort</span>
                    <span className="text-sm font-bold text-zinc-300">
                      {generatedPlan.tasks.reduce((sum, t) => sum + t.estimatedHours, 0)} hours
                    </span>
                  </div>
                </div>

                {/* Preview of Epics */}
                <div className="space-y-2">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Target Epics Generated:</span>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                    {generatedPlan.epics.map((epic, idx) => (
                      <div key={idx} className="bg-zinc-950/60 border border-zinc-800 p-2.5 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-zinc-300 truncate block">{epic.title}</span>
                        <span className="text-[9px] text-zinc-500 line-clamp-2 leading-normal">{epic.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onGenerateProject(generatedPlan)}
                className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-semibold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              >
                Assemble Project Workspace <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col justify-center items-center py-8 text-center text-zinc-500 space-y-3">
              <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl text-zinc-400">
                <Terminal className="w-8 h-8 opacity-60" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-zinc-400">Plan Visualizer</h3>
                <p className="text-[10px] text-zinc-500 max-w-xs mt-1 leading-normal">
                  Plan outlines, epic lists, priority rankings, effort estimates, and Gantt charts will be visualized here during parsing.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
