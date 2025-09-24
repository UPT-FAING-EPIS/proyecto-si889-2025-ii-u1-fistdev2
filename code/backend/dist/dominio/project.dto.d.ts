export type ProjectStatus = 'planificacion' | 'activo' | 'pausado' | 'completado' | 'cancelado';
export type ProjectPriority = 'baja' | 'media' | 'alta' | 'critica';
export type ProjectType = 'web' | 'mobile' | 'desktop' | 'api' | 'other';
export declare class CreateProjectDto {
    name: string;
    descripcion?: string;
    tipo: ProjectType;
    prioridad?: ProjectPriority;
    presupuesto?: number;
    cliente?: string;
    tecnologias?: string[];
    equipo?: string[];
    repositorio?: string;
    notas?: string;
}
export declare class UpdateProjectDto {
    name?: string;
    descripcion?: string;
    tipo?: ProjectType;
    estado?: ProjectStatus;
    prioridad?: ProjectPriority;
    progreso?: number;
    presupuesto?: number;
    cliente?: string;
    tecnologias?: string[];
    equipo?: string[];
    repositorio?: string;
    notas?: string;
}
export interface ProjectResponse {
    id: string;
    name: string;
    descripcion?: string;
    tipo: ProjectType;
    estado: ProjectStatus;
    prioridad: ProjectPriority;
    presupuesto: number;
    cliente?: string;
    tecnologias: string[];
    equipo: string[];
    progreso: number;
    repositorio?: string;
    notas?: string;
    tareas: any[];
    fases: any[];
    fechaCreacion: Date;
    fechaActualizacion: Date;
    userId: string;
}
