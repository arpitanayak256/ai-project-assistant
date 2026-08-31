import { User, Project, Epic, Task, Subtask, TaskDependency } from './types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-current',
    name: 'Alex Developer',
    email: 'alex@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'user-co-dev',
    name: 'Sarah Engineer',
    email: 'sarah@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    createdAt: '2026-08-02T10:00:00Z',
  },
  {
    id: 'user-pm',
    name: 'David Product Manager',
    email: 'david@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    createdAt: '2026-08-03T10:00:00Z',
  },
];

// Initial Projects
export const mockProjects: Project[] = [
  {
    id: 'project-exam-system',
    name: 'Online Examination System',
    description: 'An AI-powered online examination portal allowing administrators to create exams, schedule shifts, compile question banks, and support automatic grading and result sheets.',
    deadline: '2026-09-30T23:59:59Z',
    status: 'ACTIVE',
    ownerId: 'user-pm',
    createdAt: '2026-08-15T09:00:00Z',
    updatedAt: '2026-08-31T15:00:00Z',
  },
  {
    id: 'project-ai-crm',
    name: 'Smart AI CRM',
    description: 'Next-generation Customer Relationship Management system featuring call transcript summarization, smart email suggestions, and automated lead prioritization.',
    deadline: '2026-10-15T23:59:59Z',
    status: 'ACTIVE',
    ownerId: 'user-pm',
    createdAt: '2026-08-20T09:00:00Z',
    updatedAt: '2026-08-31T16:00:00Z',
  },
];

// Initial Epics
export const mockEpics: Epic[] = [
  // Exam System Epics
  {
    id: 'epic-exam-auth',
    projectId: 'project-exam-system',
    title: 'Authentication & RBAC',
    description: 'User registration, login, and Role-Based Access Control (RBAC) distinguishing Admins, Examiners, and Students.',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'epic-exam-mgmt',
    projectId: 'project-exam-system',
    title: 'Exam Management',
    description: 'Forms, tools, and interfaces for creating exams, configuring timers, passing marks, and exam layouts.',
    createdAt: '2026-08-15T10:05:00Z',
    updatedAt: '2026-08-15T10:05:00Z',
  },
  {
    id: 'epic-exam-questions',
    projectId: 'project-exam-system',
    title: 'Question Bank & Editor',
    description: 'CRUD for questions, support for MCQ, short answers, programming questions, and question tags.',
    createdAt: '2026-08-15T10:10:00Z',
    updatedAt: '2026-08-15T10:10:00Z',
  },
  {
    id: 'epic-exam-schedule',
    projectId: 'project-exam-system',
    title: 'Shift Scheduling & Centers',
    description: 'Scheduling exam shifts, assigning students to specific slots, and handling seat allocation rules.',
    createdAt: '2026-08-15T10:15:00Z',
    updatedAt: '2026-08-15T10:15:00Z',
  },
  {
    id: 'epic-exam-student',
    projectId: 'project-exam-system',
    title: 'Student Taking Portal',
    description: 'Secure student portal for taking exams, locked environment, browser tab-change trackers, and draft savers.',
    createdAt: '2026-08-15T10:20:00Z',
    updatedAt: '2026-08-15T10:20:00Z',
  },
  {
    id: 'epic-exam-results',
    projectId: 'project-exam-system',
    title: 'Grading & Analytics Dashboard',
    description: 'Auto-grading for MCQs, manual review portal for text items, and score report exports (PDF/Excel).',
    createdAt: '2026-08-15T10:25:00Z',
    updatedAt: '2026-08-15T10:25:00Z',
  },

  // AI CRM Epics
  {
    id: 'epic-crm-leads',
    projectId: 'project-ai-crm',
    title: 'Lead Intake & Score',
    description: 'Lead capture forms, APIs, and AI-driven prioritization score computations.',
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z',
  },
  {
    id: 'epic-crm-pipeline',
    projectId: 'project-ai-crm',
    title: 'Interactive Sales Kanban',
    description: 'Visual drag-and-drop board for pipeline deals, lead lifecycle logs, and deal size forecasting.',
    createdAt: '2026-08-20T10:05:00Z',
    updatedAt: '2026-08-20T10:05:00Z',
  },
  {
    id: 'epic-crm-ai-call',
    projectId: 'project-ai-crm',
    title: 'AI Audio/Transcript Analyzer',
    description: 'Pipeline to upload client calls, transcribe them, and generate structured summaries and action items.',
    createdAt: '2026-08-20T10:10:00Z',
    updatedAt: '2026-08-20T10:10:00Z',
  },
];

// Initial Tasks
export const mockTasks: Task[] = [
  // Exam System Tasks
  {
    id: 'task-exam-db',
    projectId: 'project-exam-system',
    epicId: 'epic-exam-auth',
    title: 'Design database schema for users, exams, and results',
    description: 'Define relational models for PostgreSQL, setting up Prisma schemas, keys, constraints, and indexes for high load.',
    status: 'DONE',
    priority: 'URGENT',
    estimatedHours: 8,
    dueDate: '2026-08-25',
    assigneeId: 'user-current',
    createdAt: '2026-08-16T09:00:00Z',
    updatedAt: '2026-08-24T18:00:00Z',
    aiExplanation: 'DB schemas are foundational. Estimated at 8 hours due to the complexity of the exam scheduling relations and question bank nested tables.',
  },
  {
    id: 'task-exam-jwt',
    projectId: 'project-exam-system',
    epicId: 'epic-exam-auth',
    title: 'Implement JWT login, signup, and logout endpoints',
    description: 'Implement JWT authentication in backend, bcrypt password hashing, and set up passport strategies. Create login/logout endpoints on frontend.',
    status: 'DONE',
    priority: 'URGENT',
    estimatedHours: 12,
    dueDate: '2026-08-28',
    assigneeId: 'user-co-dev',
    createdAt: '2026-08-16T09:30:00Z',
    updatedAt: '2026-08-28T17:00:00Z',
    aiExplanation: 'JWT Auth has standard complexities: token rotation, httpOnly cookie setup, and validation filters. Estimated 12h, prioritized as URGENT because all other APIs depend on auth.',
  },
  {
    id: 'task-exam-builder-ui',
    projectId: 'project-exam-system',
    epicId: 'epic-exam-mgmt',
    title: 'Create Exam Builder Form and Admin UI',
    description: 'Develop the multi-step form to create exams. Configure title, timer, total attempts, passing percentage, and schedule constraints.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    estimatedHours: 16,
    dueDate: '2026-09-05',
    assigneeId: 'user-current',
    createdAt: '2026-08-16T10:00:00Z',
    updatedAt: '2026-08-31T14:00:00Z',
    aiExplanation: 'Complex multi-step wizard UI. Requires custom validation, calendar pickers, and dynamic field injections. AI recommends 16 hours. Priority HIGH due to blockers for student portal.',
  },
  {
    id: 'task-exam-questions-editor',
    projectId: 'project-exam-system',
    epicId: 'epic-exam-questions',
    title: 'Build question editor with rich text and multiple choice options',
    description: 'Implement a rich text editor (e.g. TipTap or React-Quill) to create questions, set MCQ options, check the correct answer, and add explanations.',
    status: 'TODO',
    priority: 'HIGH',
    estimatedHours: 16,
    dueDate: '2026-09-10',
    assigneeId: 'user-co-dev',
    createdAt: '2026-08-16T10:30:00Z',
    updatedAt: '2026-08-16T10:30:00Z',
    aiExplanation: 'WYSIWYG editor integration with formula rendering (MathJax) takes extra configuration. 16 hours estimated.',
  },
  {
    id: 'task-exam-student-portal',
    projectId: 'project-exam-system',
    epicId: 'epic-exam-student',
    title: 'Develop Student Exam Taking interface with full-screen lockdown',
    description: 'Build the secure exam page. Include a countdown timer, automatic drafts saver to local storage/API, and detectors for window blurring (cheating prevention).',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    estimatedHours: 24,
    dueDate: '2026-09-08',
    assigneeId: 'user-co-dev',
    createdAt: '2026-08-16T11:00:00Z',
    updatedAt: '2026-08-31T10:00:00Z',
    aiExplanation: 'Security measures (blur events, right-click disabling) + robust local state saving to prevent data loss on network drops. Very high risk, hence 24h estimation and URGENT priority.',
  },
  {
    id: 'task-exam-scheduler',
    projectId: 'project-exam-system',
    epicId: 'epic-exam-schedule',
    title: 'Shift scheduling calendar and seat allocation',
    description: 'Implement a calendar grid for admins to allocate specific dates and shifts for various exams, ensuring no room over-capacitation.',
    status: 'TODO',
    priority: 'MEDIUM',
    estimatedHours: 14,
    dueDate: '2026-09-15',
    assigneeId: null,
    createdAt: '2026-08-16T11:30:00Z',
    updatedAt: '2026-08-16T11:30:00Z',
    aiExplanation: 'Requires conflict-checking database queries. 14 hours estimated.',
  },
  {
    id: 'task-exam-auto-grading',
    projectId: 'project-exam-system',
    epicId: 'epic-exam-results',
    title: 'Implement MCQ Auto-Grading engine',
    description: 'Build backend engine that evaluates submitted answers against question keys, computes scores, and flags items requiring human evaluation.',
    status: 'TODO',
    priority: 'HIGH',
    estimatedHours: 10,
    dueDate: '2026-09-20',
    assigneeId: 'user-current',
    createdAt: '2026-08-16T12:00:00Z',
    updatedAt: '2026-08-16T12:00:00Z',
    aiExplanation: 'Needs transaction safety and instant report generation. Estimated at 10 hours.',
  },
  {
    id: 'task-exam-export',
    projectId: 'project-exam-system',
    epicId: 'epic-exam-results',
    title: 'Excel and PDF exam report exports',
    description: 'Create an export feature for examiner dashboards to download student marksheet PDFs and complete cohort Excel spreadsheets.',
    status: 'TODO',
    priority: 'LOW',
    estimatedHours: 8,
    dueDate: '2026-09-25',
    assigneeId: null,
    createdAt: '2026-08-16T12:30:00Z',
    updatedAt: '2026-08-16T12:30:00Z',
    aiExplanation: 'Standard report generation using node libraries (ExcelJS, PDFKit). Priority is LOW since it is not a blocker for exam completion.',
  },

  // AI CRM Tasks
  {
    id: 'task-crm-db',
    projectId: 'project-ai-crm',
    epicId: 'epic-crm-leads',
    title: 'Database schema for contacts, accounts, and activities',
    description: 'Set up database schema with custom lead status and interaction history logs.',
    status: 'DONE',
    priority: 'URGENT',
    estimatedHours: 6,
    dueDate: '2026-08-25',
    assigneeId: 'user-current',
    createdAt: '2026-08-21T09:00:00Z',
    updatedAt: '2026-08-25T17:00:00Z',
    aiExplanation: 'Core schema configuration, 6 hours.',
  },
  {
    id: 'task-crm-score',
    projectId: 'project-ai-crm',
    epicId: 'epic-crm-leads',
    title: 'Develop AI lead prioritization algorithm',
    description: 'Create backend script evaluating lead size, engagement records, and company fit, feeding it to an LLM to generate an priority score.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    estimatedHours: 12,
    dueDate: '2026-09-04',
    assigneeId: 'user-current',
    createdAt: '2026-08-21T09:30:00Z',
    updatedAt: '2026-08-31T09:00:00Z',
    aiExplanation: 'LLM structuring requires robust error-handling fallback. Estimated at 12 hours.',
  },
];

// Initial Subtasks
export const mockSubtasks: Subtask[] = [
  // JWT Subtasks
  {
    id: 'sub-jwt-bcrypt',
    taskId: 'task-exam-jwt',
    title: 'Setup bcrypt password hashing utilities',
    completed: true,
    createdAt: '2026-08-26T10:00:00Z',
    updatedAt: '2026-08-26T12:00:00Z',
  },
  {
    id: 'sub-jwt-sign',
    taskId: 'task-exam-jwt',
    title: 'Write JWT token signature and verification service',
    completed: true,
    createdAt: '2026-08-26T12:00:00Z',
    updatedAt: '2026-08-26T14:00:00Z',
  },
  {
    id: 'sub-jwt-refresh',
    taskId: 'task-exam-jwt',
    title: 'Implement token rotation and refresh endpoints',
    completed: true,
    createdAt: '2026-08-27T09:00:00Z',
    updatedAt: '2026-08-27T17:00:00Z',
  },
  {
    id: 'sub-jwt-guard',
    taskId: 'task-exam-jwt',
    title: 'Add NestJS HTTP route guards for roles',
    completed: true,
    createdAt: '2026-08-28T09:00:00Z',
    updatedAt: '2026-08-28T16:30:00Z',
  },

  // Exam Builder Subtasks
  {
    id: 'sub-builder-details',
    taskId: 'task-exam-builder-ui',
    title: 'Design exam core metadata form (Title, Description, Duration)',
    completed: true,
    createdAt: '2026-08-29T10:00:00Z',
    updatedAt: '2026-08-29T14:00:00Z',
  },
  {
    id: 'sub-builder-limits',
    taskId: 'task-exam-builder-ui',
    title: 'Implement rule constraints (attempts count, pass threshold)',
    completed: false,
    createdAt: '2026-08-29T14:00:00Z',
    updatedAt: '2026-08-29T14:00:00Z',
  },
  {
    id: 'sub-builder-select',
    taskId: 'task-exam-builder-ui',
    title: 'Build question pool selector with drag-and-drop hierarchy',
    completed: false,
    createdAt: '2026-08-30T09:00:00Z',
    updatedAt: '2026-08-30T09:00:00Z',
  },
  {
    id: 'sub-builder-draft',
    taskId: 'task-exam-builder-ui',
    title: 'Add draft state saving and confirmation checks on close',
    completed: false,
    createdAt: '2026-08-31T09:00:00Z',
    updatedAt: '2026-08-31T09:00:00Z',
  },

  // Student Portal Subtasks
  {
    id: 'sub-student-timer',
    taskId: 'task-exam-student-portal',
    title: 'Build floating circular countdown timer with warning triggers',
    completed: true,
    createdAt: '2026-08-29T09:00:00Z',
    updatedAt: '2026-08-29T17:00:00Z',
  },
  {
    id: 'sub-student-tab',
    taskId: 'task-exam-student-portal',
    title: 'Integrate browser window blur count detector with alert modals',
    completed: false,
    createdAt: '2026-08-30T10:00:00Z',
    updatedAt: '2026-08-30T10:00:00Z',
  },
  {
    id: 'sub-student-draft',
    taskId: 'task-exam-student-portal',
    title: 'Implement client-side answer autosave triggers to indexedDB every 30 seconds',
    completed: false,
    createdAt: '2026-08-31T10:00:00Z',
    updatedAt: '2026-08-31T10:00:00Z',
  },
];

// Initial Dependencies
export const mockDependencies: TaskDependency[] = [
  {
    id: 'dep-1',
    taskId: 'task-exam-builder-ui', // Exam builder depends on DB
    dependsOnTaskId: 'task-exam-db',
  },
  {
    id: 'dep-2',
    taskId: 'task-exam-student-portal', // Student portal depends on DB and JWT Auth
    dependsOnTaskId: 'task-exam-db',
  },
  {
    id: 'dep-3',
    taskId: 'task-exam-student-portal',
    dependsOnTaskId: 'task-exam-jwt',
  },
  {
    id: 'dep-4',
    taskId: 'task-exam-questions-editor',
    dependsOnTaskId: 'task-exam-db',
  },
  {
    id: 'dep-5',
    taskId: 'task-exam-scheduler',
    dependsOnTaskId: 'task-exam-builder-ui',
  },
  {
    id: 'dep-6',
    taskId: 'task-exam-auto-grading',
    dependsOnTaskId: 'task-exam-student-portal',
  },
];

// Generators definitions for requirement analyzer
export interface GenerationResult {
  project: Omit<Project, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>;
  epics: Omit<Epic, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>[];
  tasks: (Omit<Task, 'id' | 'projectId' | 'epicId' | 'createdAt' | 'updatedAt'> & { epicIndex: number })[];
  dependencies: { taskIndex: number; dependsOnTaskIndex: number }[];
}

export const promptPresets: { title: string; prompt: string; result: GenerationResult }[] = [
  {
    title: 'Online Examination System',
    prompt: 'I need to build an online examination system. Admin should create exams, add questions, schedule exam shifts, students should register and receive results.',
    result: {
      project: {
        name: 'Online Examination System',
        description: 'AI-generated plan for a comprehensive examination system featuring role-based portals, question bank managers, schedules, and automatic MCQ correction.',
        status: 'ACTIVE',
      },
      epics: [
        { title: 'Authentication & Security', description: 'Student & Admin signup, login, password encryption, session checks.' },
        { title: 'Exam Builder Workspace', description: 'Admin form to design exams, timer parameters, passing values.' },
        { title: 'Question Pool Manager', description: 'System to add MCQs, essay items, short answer fields, and tags.' },
        { title: 'Slot & Shift Scheduling', description: 'Schedule exam timing slots and location seat capacities.' },
        { title: 'Exam Sitting Interface', description: 'Student view, lock screen cheat detector, local autosave.' },
        { title: 'Automatic Grading & Cohorts', description: 'MCQ grader engine, score calculation, report spreadsheets.' }
      ],
      tasks: [
        { epicIndex: 0, title: 'Database schema for users, exams, and results', description: 'Set up Prisma model relationships in PostgreSQL.', status: 'TODO', priority: 'URGENT', estimatedHours: 8, aiExplanation: 'Foundational database structure. Estimated 8 hours.' },
        { epicIndex: 0, title: 'Configure JWT Authentication endpoints', description: 'Secure auth, refresh tokens, role checks.', status: 'TODO', priority: 'URGENT', estimatedHours: 12, aiExplanation: 'Necessary backend authentication mechanism. Estimated 12 hours.' },
        { epicIndex: 1, title: 'Admin Exam Builder form views', description: 'Multi-step form configuration in NextJS.', status: 'TODO', priority: 'HIGH', estimatedHours: 16, aiExplanation: 'Requires stateful multi-step validation. Estimated 16 hours.' },
        { epicIndex: 2, title: 'WYSIWYG rich text question editor', description: 'Implement question content editing panel.', status: 'TODO', priority: 'HIGH', estimatedHours: 16, aiExplanation: 'Requires TipTap integration for rich layout. Estimated 16 hours.' },
        { epicIndex: 4, title: 'Student exam running pane with browser tab lock', description: 'Lockdown student page with blurring detection alerts.', status: 'TODO', priority: 'URGENT', estimatedHours: 24, aiExplanation: 'Complex front-end environment listener and autosave logic. Estimated 24 hours.' },
        { epicIndex: 3, title: 'Schedule shift calendars for exams', description: 'Calendar mapping system for shift configurations.', status: 'TODO', priority: 'MEDIUM', estimatedHours: 14, aiExplanation: 'Conflict checks query implementation. Estimated 14 hours.' },
        { epicIndex: 5, title: 'Engine for auto-grading MCQs', description: 'Evaluate questions automatically and save to student grades.', status: 'TODO', priority: 'HIGH', estimatedHours: 10, aiExplanation: 'Compute results from correct keys. Estimated 10 hours.' },
        { epicIndex: 5, title: 'Cohort report generator in PDF and Excel sheets', description: 'Export grades list spreadsheet for examiners.', status: 'TODO', priority: 'LOW', estimatedHours: 8, aiExplanation: 'Standard report generation library setup. Estimated 8 hours.' }
      ],
      dependencies: [
        { taskIndex: 2, dependsOnTaskIndex: 0 },
        { taskIndex: 3, dependsOnTaskIndex: 0 },
        { taskIndex: 4, dependsOnTaskIndex: 0 },
        { taskIndex: 4, dependsOnTaskIndex: 1 },
        { taskIndex: 5, dependsOnTaskIndex: 2 },
        { taskIndex: 6, dependsOnTaskIndex: 4 }
      ]
    }
  },
  {
    title: 'AI-Powered CRM Hub',
    prompt: 'I want a sales CRM that records client call audios, transcribes them with AI, generates summaries and follow-up emails, and ranks leads automatically based on urgency.',
    result: {
      project: {
        name: 'AI Sales CRM Hub',
        description: 'Next-gen customer relations system integrating transcript processors, automatic follow-ups, and lead rating agents.',
        status: 'ACTIVE',
      },
      epics: [
        { title: 'Lead Intake & Score Agent', description: 'Automatic lead capture API and AI profile validation ranking.' },
        { title: 'Interactive Deal Pipeline', description: 'Visual pipeline boards, stage trackers, status history.' },
        { title: 'AI Transcript pipeline', description: 'Upload MP3, transcribing API integration, summary outputs.' },
        { title: 'Smart Email Suggestion co-pilot', description: 'Draft suggestions, templates, automatic dispatch schedule.' }
      ],
      tasks: [
        { epicIndex: 0, title: 'Configure CRM contacts and interaction tables', description: 'Database layout containing logs of customer touches.', status: 'TODO', priority: 'URGENT', estimatedHours: 6, aiExplanation: 'Base schemas for CRM. 6 hours.' },
        { epicIndex: 0, title: 'Build lead priority scorer algorithm', description: 'Calculate score using email volume and company details.', status: 'TODO', priority: 'HIGH', estimatedHours: 12, aiExplanation: 'Formulates AI prompts to analyze lead data. 12 hours.' },
        { epicIndex: 1, title: 'Drag-and-drop sales stage board', description: 'Pipeline UI matching deal sizes and status.', status: 'TODO', priority: 'HIGH', estimatedHours: 14, aiExplanation: 'Provides simple, reactive stage shifts. 14 hours.' },
        { epicIndex: 2, title: 'Integrate Speech-To-Text Whisper backend pipeline', description: 'Audio file upload backend with API connections.', status: 'TODO', priority: 'URGENT', estimatedHours: 18, aiExplanation: 'Whisper integration, handles timeouts on long audio. 18 hours.' },
        { epicIndex: 2, title: 'AI action items and summarization generation', description: 'Generate tasks list and summaries from transcript output.', status: 'TODO', priority: 'HIGH', estimatedHours: 10, aiExplanation: 'LLM structuring prompt. 10 hours.' },
        { epicIndex: 3, title: 'Contextual draft email generator panel', description: 'Suggest reply drafts based on transcript updates.', status: 'TODO', priority: 'MEDIUM', estimatedHours: 16, aiExplanation: 'Front-end feedback templates. 16 hours.' }
      ],
      dependencies: [
        { taskIndex: 1, dependsOnTaskIndex: 0 },
        { taskIndex: 2, dependsOnTaskIndex: 0 },
        { taskIndex: 4, dependsOnTaskIndex: 3 }
      ]
    }
  },
  {
    title: 'Gym Membership Tracker & App',
    prompt: 'A mobile-friendly web app for gyms. Members sign in to book training sessions, track active subscription plans, scan QR codes at the gate, while admins oversee trainer slots and view revenue charts.',
    result: {
      project: {
        name: 'Gym Track & Booking App',
        description: 'Web dashboard and portal for members and staff featuring schedules, membership tiers, QR pass verification, and revenue charts.',
        status: 'ACTIVE',
      },
      epics: [
        { title: 'Membership & QR Gates', description: 'User subscriptions, payment packages, and gate check-in passcodes.' },
        { title: 'Shift scheduling & slots', description: 'Trainer calendars, gym capacity charts, and booking managers.' },
        { title: 'Revenue & analytics boards', description: 'Financial metrics dashboard, subscription renewals, trainer workloads.' }
      ],
      tasks: [
        { epicIndex: 0, title: 'Setup Stripe subscription backend handlers', description: 'Configures plans, payments hooks, webhooks, and billing portals.', status: 'TODO', priority: 'URGENT', estimatedHours: 16, aiExplanation: 'Requires robust webhook listeners and tier validation. 16 hours.' },
        { epicIndex: 0, title: 'Build member QR generator and gate validator', description: 'Dynamic QR coder matching profile hashes to open check-in gate.', status: 'TODO', priority: 'HIGH', estimatedHours: 10, aiExplanation: 'Client-side QR creation, scanning libraries, validator API. 10 hours.' },
        { epicIndex: 1, title: 'Booking slots scheduler for gym shifts', description: 'Mobile view to select slots, trainers, and cancel sessions.', status: 'TODO', priority: 'HIGH', estimatedHours: 18, aiExplanation: 'Complex scheduling conflicts, limits per trainer. 18 hours.' },
        { epicIndex: 2, title: 'Admin revenue analysis and occupancy graph UI', description: 'Financial metrics and gym peak hours SVG charts.', status: 'TODO', priority: 'MEDIUM', estimatedHours: 12, aiExplanation: 'Analytics computation, chart renderings. 12 hours.' }
      ],
      dependencies: [
        { taskIndex: 1, dependsOnTaskIndex: 0 },
        { taskIndex: 2, dependsOnTaskIndex: 0 }
      ]
    }
  }
];
