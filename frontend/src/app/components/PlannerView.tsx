'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Terminal, FileText, Send, Layers, GitFork, ArrowRight, Play, Paperclip, X, Database, Network, GitBranch } from 'lucide-react';
import mermaid from 'mermaid';

export interface GeneratedSubtask {
  title: string;
}
export interface GeneratedTask {
  tempId: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedHours: number;
  subtasks: GeneratedSubtask[];
  dependsOnTempIds?: string[];
  aiExplanation?: string;
}
export interface GeneratedEpic {
  title: string;
  description: string;
  tasks: GeneratedTask[];
}
export interface GeneratedProjectPlan {
  projectName: string;
  projectDescription: string;
  epics: GeneratedEpic[];
}

interface PlannerViewProps {
  onProjectImported: () => void;
}

export default function PlannerView({ onProjectImported }: PlannerViewProps) {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedProjectPlan | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'epics' | 'architecture' | 'database' | 'api'>('epics');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { title: 'Analyzing Requirements', desc: 'Running NLP parser on unstructured requirements...', icon: Terminal },
    { title: 'Designing Project Architecture', desc: 'Extracting product summary & defining milestones...', icon: FileText },
    { title: 'Drafting Epics & Work Modules', desc: 'Synthesizing epics, categories and subtask outlines...', icon: Layers },
    { title: 'Breaking Down Into Actionable Tasks', desc: 'Formulating task lists, assigning priorities and effort hours...', icon: Send },
    { title: 'Resolving Dependency Network', desc: 'Configuring topological sort for execution timelines...', icon: GitFork }
  ];

  // Run generation step animations while waiting for backend
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setGenerationStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2000); // Step every 2 seconds while waiting for AI
    return () => clearInterval(interval);
  }, [isGenerating, steps.length]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && files.length === 0) return;

    setIsGenerating(true);
    setGenerationStep(0);
    setGeneratedPlan(null);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      files.forEach((file) => {
        formData.append('files', file); // 'files' must match what Multer expects in the backend
      });

      const response = await fetch('http://localhost:3001/ai/generate-plan', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate project plan from the backend.');
      }

      const resultPlan = await response.json();
      setGeneratedPlan(resultPlan);
    } catch (error: any) {
      console.error('Generation error:', error);
      setErrorMsg(error.message || 'An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImport = async () => {
    if (!generatedPlan) return;
    setIsImporting(true);
    try {
      const response = await fetch('http://localhost:3001/projects/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedPlan),
      });
      if (!response.ok) throw new Error('Failed to import project');
      onProjectImported();
    } catch (error: any) {
      setErrorMsg(error.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const totalTasks = generatedPlan?.epics.reduce((sum, e) => sum + e.tasks.length, 0) || 0;
  const totalEffort = generatedPlan?.epics.reduce(
    (sum, e) => sum + e.tasks.reduce((s, t) => s + t.estimatedHours, 0),
    0
  ) || 0;

  useEffect(() => {
    if (generatedPlan && activeTab === 'architecture') {
      mermaid.initialize({ startOnLoad: false, theme: 'dark' });
      mermaid.run({ querySelector: '.mermaid' });
    }
  }, [generatedPlan, activeTab]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left Column: Requirements Input */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">AI Requirement Planner</h2>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500">Provide unstructured specs or upload PDFs/Images</p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your application requirements... (e.g. 'I need to build an online examination system.')"
                className="w-full h-44 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 pb-12 text-xs text-zinc-700 dark:text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 leading-relaxed resize-none"
                disabled={isGenerating || isImporting}
              />
              
              {/* File Upload Trigger */}
              <div className="absolute left-3 bottom-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGenerating || isImporting}
                  className="p-1.5 text-zinc-500 dark:text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                  title="Attach PDFs or Screenshots"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,image/*"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isGenerating || isImporting || (!prompt.trim() && files.length === 0)}
                className="absolute right-3 bottom-3 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
            
            {/* Attached Files List */}
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {files.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 px-2 py-1 rounded-md text-[10px] text-zinc-700 dark:text-zinc-300">
                    <span className="truncate max-w-[120px]">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      disabled={isGenerating || isImporting}
                      className="text-zinc-500 dark:text-zinc-500 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </form>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Execution Output */}
      <div className="lg:col-span-3">
        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl h-full flex flex-col min-h-[400px] justify-between relative overflow-hidden">
          {/* Background grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e1e2e_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

          {isGenerating ? (
            /* Generating State */
            <div className="flex-1 flex flex-col justify-center items-center py-8 space-y-8 relative z-10">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-2 border border-violet-500/20 rounded-full flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
              </div>

              <div className="space-y-4 w-full max-w-sm">
                <h3 className="text-center font-bold text-sm text-zinc-800 dark:text-zinc-200">AI Plan Orchestrator</h3>
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
                            : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'
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
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{generatedPlan.projectName}</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{generatedPlan.projectDescription}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 border-y border-zinc-200 dark:border-zinc-800/80 py-4">
                  <div className="text-center space-y-0.5">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-500 block">Total Epics</span>
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{generatedPlan.epics.length}</span>
                  </div>
                  <div className="text-center space-y-0.5 border-x border-zinc-200 dark:border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-500 block">Task Breakdown</span>
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{totalTasks} items</span>
                  </div>
                  <div className="text-center space-y-0.5">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-500 block">Total Effort</span>
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                      {totalEffort} hours
                    </span>
                  </div>
                </div>

                {/* Tabbed Navigation */}
                <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <button onClick={() => setActiveTab('epics')} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'epics' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300'}`}>
                    <Layers className="w-3 h-3" /> Epics & Tasks
                  </button>
                  <button onClick={() => setActiveTab('architecture')} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'architecture' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300'}`}>
                    <GitBranch className="w-3 h-3" /> Architecture
                  </button>
                  <button onClick={() => setActiveTab('database')} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'database' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300'}`}>
                    <Database className="w-3 h-3" /> Database
                  </button>
                  <button onClick={() => setActiveTab('api')} className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'api' ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300'}`}>
                    <Network className="w-3 h-3" /> API Routes
                  </button>
                </div>

                {/* Render Active Tab */}
                <div className="space-y-2">
                  {activeTab === 'epics' && (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {generatedPlan.epics.map((epic, eIdx) => (
                        <div key={eIdx} className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl space-y-2">
                          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">{epic.title}</span>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-500 leading-normal">{epic.description}</span>
                          </div>
                          <div className="space-y-2">
                            {epic.tasks.map((task, tIdx) => (
                              <div key={tIdx} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 p-2 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">{task.title}</span>
                                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{task.estimatedHours}h</span>
                                </div>
                                {task.subtasks && task.subtasks.length > 0 && (
                                  <div className="mt-1.5 pl-2 border-l border-indigo-500/30 space-y-1">
                                    {task.subtasks.map((sub, sIdx) => (
                                      <div key={sIdx} className="text-[9px] text-zinc-500 dark:text-zinc-500 flex gap-1 items-center">
                                        <span className="w-1 h-1 rounded-full bg-zinc-700 shrink-0" />
                                        <span className="truncate">{sub.title}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'architecture' && generatedPlan.architectureDiagram && (
                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl max-h-64 overflow-auto flex justify-center custom-scrollbar">
                      <pre className="mermaid text-[10px]">{generatedPlan.architectureDiagram}</pre>
                    </div>
                  )}

                  {activeTab === 'database' && generatedPlan.databaseSchema && (
                    <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {generatedPlan.databaseSchema.map((table, idx) => (
                        <div key={idx} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 space-y-2">
                          <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-200 dark:border-zinc-850">
                            <Database className="w-3 h-3 text-indigo-400" />
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{table.tableName}</span>
                          </div>
                          <div className="space-y-1">
                            {table.columns.map((col, cIdx) => (
                              <div key={cIdx} className="text-[9px] text-zinc-600 dark:text-zinc-400 font-mono">{col}</div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'api' && generatedPlan.apiEndpoints && (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {generatedPlan.apiEndpoints.map((api, idx) => (
                        <div key={idx} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-lg flex items-start gap-3">
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${api.method === 'GET' ? 'bg-blue-500/10 text-blue-400' : api.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400' : api.method === 'PUT' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                            {api.method}
                          </span>
                          <div>
                            <span className="text-[10px] font-mono text-zinc-700 dark:text-zinc-300 block mb-0.5">{api.path}</span>
                            <span className="text-[9px] text-zinc-500 dark:text-zinc-500 leading-normal">{api.purpose}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleImport}
                disabled={isImporting}
                className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-semibold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isImporting ? 'Importing...' : 'Confirm & Import to PostgreSQL'} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col justify-center items-center py-8 text-center text-zinc-500 dark:text-zinc-500 space-y-3">
              <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-zinc-600 dark:text-zinc-400">
                <Terminal className="w-8 h-8 opacity-60" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-zinc-600 dark:text-zinc-400">Plan Visualizer</h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-500 max-w-xs mt-1 leading-normal">
                  Upload PDF requirements, screenshots, or type your idea. The AI will stream the generated project plan here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
