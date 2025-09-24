"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../com\u00FAn/prisma.service");
const logger_service_1 = require("../../com\u00FAn/logger.service");
let ProjectService = class ProjectService {
    constructor(prisma, logger) {
        this.prisma = prisma;
        this.logger = logger;
    }
    async create(createProjectDto, userId) {
        try {
            this.logger.log(`🔄 Creando proyecto: ${createProjectDto.name}`, 'ProjectService');
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
            await this.prisma.projectMember.create({
                data: {
                    projectId: newProject.id,
                    userId: userId,
                    role: 'OWNER'
                }
            });
            this.logger.log(`✅ Proyecto creado exitosamente: ${newProject.name}`, 'ProjectService');
            return this.mapProjectToResponse(newProject);
        }
        catch (error) {
            this.logger.error(`Error creando proyecto: ${error.message}`, error.stack, 'ProjectService');
            throw error;
        }
    }
    async findAll(userId) {
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
        }
        catch (error) {
            this.logger.error(`Error obteniendo proyectos: ${error.message}`, error.stack, 'ProjectService');
            throw error;
        }
    }
    async findOne(id, userId) {
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
        }
        catch (error) {
            this.logger.error(`Error buscando proyecto: ${error.message}`, error.stack, 'ProjectService');
            throw error;
        }
    }
    async update(id, updateProjectDto, userId) {
        try {
            this.logger.log(`🔄 Actualizando proyecto: ${id}`, 'ProjectService');
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
            const updateData = {
                updatedAt: new Date()
            };
            if (updateProjectDto.name)
                updateData.name = updateProjectDto.name;
            if (updateProjectDto.descripcion !== undefined)
                updateData.description = updateProjectDto.descripcion;
            if (updateProjectDto.estado)
                updateData.status = this.validateAndMapStatus(updateProjectDto.estado);
            if (updateProjectDto.prioridad)
                updateData.priority = this.validateAndMapPriority(updateProjectDto.prioridad);
            if (updateProjectDto.tipo)
                updateData.type = this.validateAndMapProjectType(updateProjectDto.tipo);
            if (updateProjectDto.presupuesto !== undefined)
                updateData.budget = updateProjectDto.presupuesto;
            if (updateProjectDto.cliente !== undefined)
                updateData.client = updateProjectDto.cliente;
            if (updateProjectDto.tecnologias)
                updateData.technologies = updateProjectDto.tecnologias;
            if (updateProjectDto.repositorio !== undefined)
                updateData.repository = updateProjectDto.repositorio;
            if (updateProjectDto.notas !== undefined)
                updateData.notes = updateProjectDto.notas;
            if (updateProjectDto.progreso !== undefined)
                updateData.progress = updateProjectDto.progreso;
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
        }
        catch (error) {
            this.logger.error(`Error actualizando proyecto: ${error.message}`, error.stack, 'ProjectService');
            throw error;
        }
    }
    async remove(id, userId) {
        try {
            this.logger.log(`🗑️ Eliminando proyecto: ${id}`, 'ProjectService');
            const project = await this.prisma.project.findFirst({
                where: {
                    id: id,
                    userId: userId
                }
            });
            if (!project) {
                throw new Error('Proyecto no encontrado o sin permisos de eliminación');
            }
            await this.prisma.projectMember.deleteMany({
                where: { projectId: id }
            });
            await this.prisma.project.delete({
                where: { id }
            });
            this.logger.log(`✅ Proyecto eliminado: ${project.name}`, 'ProjectService');
            return true;
        }
        catch (error) {
            this.logger.error(`Error eliminando proyecto: ${error.message}`, error.stack, 'ProjectService');
            return false;
        }
    }
    async getStatistics(userId) {
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
                progresoPromedio: 0
            };
            this.logger.log(`✅ Estadísticas calculadas: ${stats.total} proyectos`, 'ProjectService');
            return stats;
        }
        catch (error) {
            this.logger.error(`Error obteniendo estadísticas: ${error.message}`, error.stack, 'ProjectService');
            throw error;
        }
    }
    mapProjectToResponse(project) {
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
            equipo: project.members?.map((member) => member.user?.name || member.user?.email || 'Usuario') || [],
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
    validateAndMapProjectType(tipo) {
        const validTypes = ['WEB', 'MOBILE', 'DESKTOP', 'API', 'OTHER'];
        const mappedType = tipo?.toUpperCase() || 'WEB';
        return validTypes.includes(mappedType) ? mappedType : 'WEB';
    }
    validateAndMapPriority(prioridad) {
        const validPriorities = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];
        const mappedPriority = prioridad?.toUpperCase() || 'MEDIA';
        return validPriorities.includes(mappedPriority) ? mappedPriority : 'MEDIA';
    }
    validateAndMapStatus(estado) {
        const validStatuses = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];
        const mappedStatus = estado?.toUpperCase() || 'PLANNING';
        return validStatuses.includes(mappedStatus) ? mappedStatus : 'PLANNING';
    }
    mapTypeToResponse(type) {
        const typeMap = {
            'WEB': 'web',
            'MOBILE': 'mobile',
            'DESKTOP': 'desktop',
            'API': 'api',
            'OTHER': 'other'
        };
        return typeMap[type || 'WEB'] || 'web';
    }
    mapStatusToResponse(status) {
        const statusMap = {
            'PLANNING': 'planificacion',
            'ACTIVE': 'activo',
            'ON_HOLD': 'pausado',
            'COMPLETED': 'completado',
            'CANCELLED': 'cancelado'
        };
        return statusMap[status || 'PLANNING'] || 'planificacion';
    }
    mapPriorityToResponse(priority) {
        const priorityMap = {
            'BAJA': 'baja',
            'MEDIA': 'media',
            'ALTA': 'alta',
            'CRITICA': 'critica'
        };
        return priorityMap[priority || 'MEDIA'] || 'media';
    }
};
exports.ProjectService = ProjectService;
exports.ProjectService = ProjectService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        logger_service_1.LoggerService])
], ProjectService);
//# sourceMappingURL=project.service.js.map