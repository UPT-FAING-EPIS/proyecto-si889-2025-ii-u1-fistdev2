export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  password?: string; // Opcional para respuestas donde no se incluye
  passwordHash?: string; // Para uso interno
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: Date;
  endDate?: Date;
  userId: string;
  user?: User;
  tasks?: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  projectId: string;
  project?: Project;
  assignedUserId?: string;
  assignedUser?: User;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UMLDiagram {
  id: string;
  type: DiagramType;
  title: string;
  content: string;
  projectId: string;
  project?: Project;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DesignTokens {
  id: string;
  name: string;
  colors: Record<string, any>;
  typography: Record<string, any>;
  spacing: Record<string, any>;
  borderRadius: Record<string, any>;
  shadows: Record<string, any>;
  projectId: string;
  project?: Project;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeFile {
  id: string;
  filename: string;
  filepath: string;
  content: string;
  language: string;
  projectId: string;
  project?: Project;
  size: number;
  lastModified: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestResult {
  id: string;
  testSuite: string;
  testName: string;
  status: TestStatus;
  passed: number;
  failed: number;
  skipped: number;
  coverage: number;
  duration: number;
  projectId: string;
  project?: Project;
  errorMessage?: string;
  logs?: string;
  runAt: Date;
  createdAt: Date;
}

export interface Deployment {
  id: string;
  version: string;
  environment: string;
  status: DeployStatus;
  projectId: string;
  project?: Project;
  buildUrl?: string;
  deployUrl?: string;
  logs?: string;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  projectId: string;
  project?: Project;
  tags: Record<string, string>;
  createdAt: Date;
}

export interface Alert {
  id: string;
  name: string;
  description: string;
  condition: string;
  threshold: number;
  severity: AlertSeverity;
  isActive: boolean;
  projectId: string;
  project?: Project;
  triggeredAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskStatus {
  BACKLOG = 'backlog',
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  TESTING = 'testing',
  DONE = 'done',
  CANCELLED = 'cancelled'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum DiagramType {
  CLASS = 'class',
  SEQUENCE = 'sequence',
  ACTIVITY = 'activity',
  USE_CASE = 'use_case',
  STATE = 'state',
  COMPONENT = 'component',
  DEPLOYMENT = 'deployment'
}

export enum TestStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PASSED = 'passed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  ERROR = 'error'
}

export enum DeployStatus {
  PENDING = 'pending',
  BUILDING = 'building',
  DEPLOYING = 'deploying',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  ROLLBACK = 'rollback'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}
