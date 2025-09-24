import { Injectable } from '@nestjs/common';
import { CreateProjectDto, UpdateProjectDto, ProjectResponse, ProjectPriority, ProjectStatus, ProjectType } from '../../dominio/project.dto';
import { PrismaService } from '../../común/prisma.service';
import { LoggerService } from '../../común/logger.service';

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<ProjectResponse> {
    try {
      this.logger.log(`🔄 Creando proyecto: ${createProjectDto.name}`, 'ProjectService');

      // Validar y mapear tipos correctamente
      const projectType = this.validateAndMapProjectType(createProjectDto.tipo);
      const projectPriority = this.validateAndMapPriority(createProjectDto.prioridad);

      const newProject = await this.prisma.project.create({
        data: {
          name: createProjectDto.name,
          description: createProjectDto.descripcion || '',
          type: projectType,
          priority: projectPriority,
          budget: createProjectDto.presupuesto || 0,
          client: createProjectDto.cliente || '',
          technologies: createProjectDto.tecnologias || [],
          repository: createProjectDto.repositorio || '',
          notes: createProjectDto.notas || '',
          progress: 0,
          status: 'PLANNING',
          isShared: false,
          userId: userId,
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      // Crear membresía del owner
      await this.prisma.projectMember.create({
        data: {
          projectId: newProject.id,
          userId: userId,
          role: 'OWNER'
        }
      });

      this.logger.log(`✅ Proyecto creado exitosamente: ${newProject.name}`, 'ProjectService');
      return this.mapProjectToResponse(newProject);
    } catch (error) {
      this.logger.error(`Error creando proyecto: ${error.message}`, error.stack, 'ProjectService');
      throw error;
    }
  }

  async findAll(userId: string): Promise<ProjectResponse[]> {
    try {
      this.logger.log(`🔍 Obteniendo proyectos para usuario: ${userId}`, 'ProjectService');

      const projects = await this.prisma.project.findMany({
        where: {
          OR: [
            { userId: userId },
            {
              members: {
                some: {
                  userId: userId
                }
              }
            }
          ]
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      this.logger.log(`✅ Encontrados ${projects.length} proyectos`, 'ProjectService');
      return projects.map(project => this.mapProjectToResponse(project));
    } catch (error) {
      this.logger.error(`Error obteniendo proyectos: ${error.message}`, error.stack, 'ProjectService');
      throw error;
    }
  }

  async findOne(id: string, userId: string): Promise<ProjectResponse> {
    try {
      this.logger.log(`🔍 Buscando proyecto: ${id}`, 'ProjectService');

      const project = await this.prisma.project.findFirst({
        where: {
          id: id,
          OR: [
            { userId: userId },
            {
              members: {
                some: {
                  userId: userId
                }
              }
            }
          ]
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      if (!project) {
        throw new Error('Proyecto no encontrado');
      }

      this.logger.log(`✅ Proyecto encontrado: ${project.name}`, 'ProjectService');
      return this.mapProjectToResponse(project);
    } catch (error) {
      this.logger.error(`Error buscando proyecto: ${error.message}`, error.stack, 'ProjectService');
      throw error;
    }
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<ProjectResponse> {
    try {
      this.logger.log(`🔄 Actualizando proyecto: ${id}`, 'ProjectService');

      // Verificar que el usuario tiene permisos
      const existingProject = await this.prisma.project.findFirst({
        where: {
          id: id,
          OR: [
            { userId: userId },
            {
              members: {
                some: {
                  userId: userId,
                  role: { in: ['OWNER', 'MEMBER'] }
                }
              }
            }
          ]
        }
      });

      if (!existingProject) {
        throw new Error('Proyecto no encontrado o sin permisos');
      }

      const updateData: any = {
        updatedAt: new Date()
      };

      if (updateProjectDto.name) updateData.name = updateProjectDto.name;
      if (updateProjectDto.descripcion !== undefined) updateData.description = updateProjectDto.descripcion;
      if (updateProjectDto.estado) updateData.status = this.validateAndMapStatus(updateProjectDto.estado);
      if (updateProjectDto.prioridad) updateData.priority = this.validateAndMapPriority(updateProjectDto.prioridad);
      if (updateProjectDto.tipo) updateData.type = this.validateAndMapProjectType(updateProjectDto.tipo);
      if (updateProjectDto.presupuesto !== undefined) updateData.budget = updateProjectDto.presupuesto;
      if (updateProjectDto.cliente !== undefined) updateData.client = updateProjectDto.cliente;
      if (updateProjectDto.tecnologias) updateData.technologies = updateProjectDto.tecnologias;
      if (updateProjectDto.repositorio !== undefined) updateData.repository = updateProjectDto.repositorio;
      if (updateProjectDto.notas !== undefined) updateData.notes = updateProjectDto.notas;
      if (updateProjectDto.progreso !== undefined) updateData.progress = updateProjectDto.progreso;

      const updatedProject = await this.prisma.project.update({
        where: { id },
        data: updateData,
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      this.logger.log(`✅ Proyecto actualizado: ${updatedProject.name}`, 'ProjectService');
      return this.mapProjectToResponse(updatedProject);
    } catch (error) {
      this.logger.error(`Error actualizando proyecto: ${error.message}`, error.stack, 'ProjectService');
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<boolean> {
    try {
      this.logger.log(`🗑️ Eliminando proyecto: ${id}`, 'ProjectService');

      // Verificar que el usuario es el owner
      const project = await this.prisma.project.findFirst({
        where: {
          id: id,
          userId: userId
        }
      });

      if (!project) {
        throw new Error('Proyecto no encontrado o sin permisos de eliminación');
      }

      // Eliminar membresías primero
      await this.prisma.projectMember.deleteMany({
        where: { projectId: id }
      });

      // Eliminar el proyecto
      await this.prisma.project.delete({
        where: { id }
      });

      this.logger.log(`✅ Proyecto eliminado: ${project.name}`, 'ProjectService');
      return true;
    } catch (error) {
      this.logger.error(`Error eliminando proyecto: ${error.message}`, error.stack, 'ProjectService');
      return false;
    }
  }

  async getStatistics(userId: string) {
    try {
      this.logger.log(`📊 Obteniendo estadísticas para usuario: ${userId}`, 'ProjectService');

      const projects = await this.prisma.project.findMany({
        where: {
          OR: [
            { userId: userId },
            {
              members: {
                some: {
                  userId: userId
                }
              }
            }
          ]
        },
        select: {
          status: true
        }
      });

      const stats = {
        total: projects.length,
        activos: projects.filter(p => p.status === 'ACTIVE').length,
        completados: projects.filter(p => p.status === 'COMPLETED').length,
        pausados: projects.filter(p => p.status === 'ON_HOLD').length,
        planificacion: projects.filter(p => p.status === 'PLANNING').length,
        progresoPromedio: 0 // Calculado basado en tareas completadas
      };

      this.logger.log(`✅ Estadísticas calculadas: ${stats.total} proyectos`, 'ProjectService');
      return stats;
    } catch (error) {
      this.logger.error(`Error obteniendo estadísticas: ${error.message}`, error.stack, 'ProjectService');
      throw error;
    }
  }

  private mapProjectToResponse(project: any): ProjectResponse {
     return {
       id: project.id,
       name: project.name,
       descripcion: project.description || '',
       tipo: this.mapTypeToResponse(project.type),
       estado: this.mapStatusToResponse(project.status),
       prioridad: this.mapPriorityToResponse(project.priority),
       presupuesto: project.budget || 0,
       cliente: project.client || '',
       tecnologias: project.technologies || [],
       equipo: project.members?.map((member: any) => member.user?.name || member.user?.email || 'Usuario') || [],
       progreso: project.progress || 0,
       repositorio: project.repository || '',
       notas: project.notes || '',
       tareas: [],
       fases: [],
       fechaCreacion: project.createdAt,
       fechaActualizacion: project.updatedAt,
       userId: project.userId
     };
   }

   // Métodos de validación y mapeo
   private validateAndMapProjectType(tipo?: string): string {
     const validTypes = ['WEB', 'MOBILE', 'DESKTOP', 'API', 'OTHER'];
     const mappedType = tipo?.toUpperCase() || 'WEB';
     return validTypes.includes(mappedType) ? mappedType : 'WEB';
   }

   private validateAndMapPriority(prioridad?: string): string {
     const validPriorities = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];
     const mappedPriority = prioridad?.toUpperCase() || 'MEDIA';
     return validPriorities.includes(mappedPriority) ? mappedPriority : 'MEDIA';
   }

   private validateAndMapStatus(estado?: string): string {
     const validStatuses = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];
     const mappedStatus = estado?.toUpperCase() || 'PLANNING';
     return validStatuses.includes(mappedStatus) ? mappedStatus : 'PLANNING';
   }

   // Métodos de mapeo para respuesta
   private mapTypeToResponse(type?: string): ProjectType {
     const typeMap: { [key: string]: ProjectType } = {
       'WEB': 'web',
       'MOBILE': 'mobile',
       'DESKTOP': 'desktop',
       'API': 'api',
       'OTHER': 'other'
     };
     return typeMap[type || 'WEB'] || 'web';
   }

   private mapStatusToResponse(status?: string): ProjectStatus {
     const statusMap: { [key: string]: ProjectStatus } = {
       'PLANNING': 'planificacion',
       'ACTIVE': 'activo',
       'ON_HOLD': 'pausado',
       'COMPLETED': 'completado',
       'CANCELLED': 'cancelado'
     };
     return statusMap[status || 'PLANNING'] || 'planificacion';
   }

   private mapPriorityToResponse(priority?: string): ProjectPriority {
     const priorityMap: { [key: string]: ProjectPriority } = {
       'BAJA': 'baja',
       'MEDIA': 'media',
       'ALTA': 'alta',
       'CRITICA': 'critica'
     };
     return priorityMap[priority || 'MEDIA'] || 'media';
   }
 }
