export type ProjectStatus = 'planificacion' | 'analisis' | 'diseño' | 'desarrollo' | 'pruebas' | 'despliegue' | 'mantenimiento' | 'completado';
export type ProjectPriority = 'baja' | 'media' | 'alta' | 'critica';
export type ProjectType = 'web' | 'mobile' | 'desktop' | 'api' | 'fullstack';
export interface ProjectEntity {
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
