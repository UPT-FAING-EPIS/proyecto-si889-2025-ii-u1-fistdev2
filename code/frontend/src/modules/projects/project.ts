export interface Project {
  id: string;
  name: string;
  descripcion: string;
  tipo: 'web' | 'mobile' | 'desktop' | 'api' | 'fullstack';
  estado: 'planificacion' | 'activo' | 'pausado' | 'completado' | 'cancelado';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  fechaCreacion: Date;
  fechaActualizacion: Date;
  fechaInicio?: Date;
  fechaFin?: Date;
  progreso: number; // 0-100
  presupuesto?: number;
  cliente?: string;
  tecnologias: string[];
  equipo: ProjectMember[];
  tareas: Task[];
  fases: ProjectPhase[];
  repositorio?: string;
  url?: string;
  documentacion?: string;
  notas?: string;
  userId?: string; // ID del usuario propietario del proyecto
}

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  rol: 'project_manager' | 'developer' | 'designer' | 'tester' | 'client';
  avatar?: string;
}

export interface Task {
  id: string;
  titulo: string;
  descripcion?: string;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'bloqueada';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  asignadoA?: string; // ID del miembro del equipo
  fechaCreacion: Date;
  fechaVencimiento?: Date;
  fechaCompletada?: Date;
  etiquetas: string[];
  comentarios: TaskComment[];
  estimacion?: number; // horas
  tiempoReal?: number; // horas
}

export interface TaskComment {
  id: string;
  autor: string;
  contenido: string;
  fecha: Date;
}

export interface ProjectPhase {
  id: string;
  name: string;
  descripcion?: string;
  orden: number;
  estado: 'pendiente' | 'en_progreso' | 'completada';
  fechaInicio?: Date;
  fechaFin?: Date;
  tareas: string[]; // IDs de tareas asociadas
  hitos: Milestone[];
}

export interface Milestone {
  id: string;
  name: string;
  descripcion?: string;
  fecha: Date;
  completado: boolean;
}

export interface ProjectFilters {
  tipo?: string[];
  estado?: string[];
  prioridad?: string[];
  fechaDesde?: Date;
  fechaHasta?: Date;
  busqueda?: string;
}

export interface ProjectStats {
  total: number;
  activos: number;
  completados: number;
  pausados: number;
  porTipo: Record<string, number>;
  porPrioridad: Record<string, number>;
}

// Enums para mayor tipado
export enum ProjectType {
  WEB = 'web',
  MOBILE = 'mobile',
  DESKTOP = 'desktop',
  API = 'api',
  FULLSTACK = 'fullstack'
}

export enum ProjectStatus {
  PLANNING = 'planificacion',
  ACTIVE = 'activo',
  PAUSED = 'pausado',
  COMPLETED = 'completado',
  CANCELLED = 'cancelado'
}

export enum Priority {
  LOW = 'baja',
  MEDIUM = 'media',
  HIGH = 'alta',
  CRITICAL = 'critica'
}

export enum TaskStatus {
  PENDING = 'pendiente',
  IN_PROGRESS = 'en_progreso',
  COMPLETED = 'completada',
  BLOCKED = 'bloqueada'
}

export enum MemberRole {
  PROJECT_MANAGER = 'project_manager',
  DEVELOPER = 'developer',
  DESIGNER = 'designer',
  TESTER = 'tester',
  CLIENT = 'client'
}
