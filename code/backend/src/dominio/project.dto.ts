import { IsString, IsEnum, IsOptional, IsNumber, IsArray, Min, Max } from 'class-validator';

// Tipos que coinciden con los enums de la BD pero en formato de respuesta
export type ProjectStatus = 'planificacion' | 'activo' | 'pausado' | 'completado' | 'cancelado';
export type ProjectPriority = 'baja' | 'media' | 'alta' | 'critica';
export type ProjectType = 'web' | 'mobile' | 'desktop' | 'api' | 'other';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsEnum(['web', 'mobile', 'desktop', 'api', 'other'])
  tipo: ProjectType;

  @IsOptional()
  @IsEnum(['baja', 'media', 'alta', 'critica'])
  prioridad?: ProjectPriority;

  @IsOptional()
  @IsNumber()
  @Min(0)
  presupuesto?: number;

  @IsOptional()
  @IsString()
  cliente?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tecnologias?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipo?: string[];

  @IsOptional()
  @IsString()
  repositorio?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(['web', 'mobile', 'desktop', 'api', 'other'])
  tipo?: ProjectType;

  @IsOptional()
  @IsEnum(['planificacion', 'activo', 'pausado', 'completado', 'cancelado'])
  estado?: ProjectStatus;

  @IsOptional()
  @IsEnum(['baja', 'media', 'alta', 'critica'])
  prioridad?: ProjectPriority;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progreso?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  presupuesto?: number;

  @IsOptional()
  @IsString()
  cliente?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tecnologias?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipo?: string[];

  @IsOptional()
  @IsString()
  repositorio?: string;

  @IsOptional()
  @IsString()
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
