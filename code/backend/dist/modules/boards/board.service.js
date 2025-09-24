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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardService = void 0;
const common_1 = require("@nestjs/common");
const collaboration_gateway_1 = require("../collaboration/collaboration.gateway");
const membership_service_1 = require("../membership/membership.service");
const logger_service_1 = require("../../com\u00FAn/logger.service");
const prisma_service_1 = require("../../com\u00FAn/prisma.service");
let BoardService = class BoardService {
    constructor(collaborationGateway, membershipService, logger, prisma) {
        this.collaborationGateway = collaborationGateway;
        this.membershipService = membershipService;
        this.logger = logger;
        this.prisma = prisma;
    }
    async validateProjectMembership(projectId, userId) {
        const result = await this.membershipService.isMember(projectId, userId);
        const isMember = result.isMember;
        if (!isMember) {
            throw new Error('No tienes permisos para acceder a este proyecto');
        }
    }
    async emitBoardEvent(projectId, eventType, actor, payload) {
        try {
            await this.collaborationGateway.emitBoardEvent('project:' + projectId, {
                type: eventType,
                projectId,
                actor,
                payload,
                timestamp: new Date()
            });
        }
        catch (error) {
            this.logger.error('Error emitting board event:', error);
        }
    }
    mapBoardToResponse(board) {
        return {
            id: board.id,
            projectId: board.projectId,
            name: board.name,
            description: board.description,
            columns: board.columns?.map((column) => ({
                id: column.id,
                boardId: column.boardId,
                title: column.title,
                position: column.position,
                color: column.color,
                tasks: column.tasks?.map((task) => ({
                    id: task.id,
                    columnId: task.columnId,
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    assignedTo: task.assignedTo,
                    estimatedHours: task.estimatedHours,
                    tags: task.tags,
                    position: task.position,
                    status: task.status,
                    createdAt: task.createdAt,
                    updatedAt: task.updatedAt,
                    createdBy: task.createdBy,
                    lastModifiedBy: task.lastModifiedBy
                })) || [],
                createdAt: column.createdAt,
                updatedAt: column.updatedAt
            })) || [],
            createdAt: board.createdAt,
            updatedAt: board.updatedAt,
            createdBy: board.createdBy
        };
    }
    async createBoard(boardData) {
        try {
            const createdBoard = await this.prisma.board.create({
                data: {
                    projectId: boardData.projectId,
                    name: boardData.name || 'Nuevo Tablero',
                    description: boardData.description,
                    createdBy: boardData.createdBy
                },
                include: {
                    columns: {
                        orderBy: { position: 'asc' },
                        include: {
                            tasks: {
                                orderBy: { position: 'asc' }
                            }
                        }
                    }
                }
            });
            if (createdBoard.columns.length === 0) {
                await this.createDefaultColumns(createdBoard.id);
                const boardWithColumns = await this.prisma.board.findUnique({
                    where: { id: createdBoard.id },
                    include: {
                        columns: {
                            orderBy: { position: 'asc' },
                            include: {
                                tasks: {
                                    orderBy: { position: 'asc' }
                                }
                            }
                        }
                    }
                });
                return this.mapBoardToResponse(boardWithColumns);
            }
            return this.mapBoardToResponse(createdBoard);
        }
        catch (error) {
            this.logger.error('Error creating board:', error);
            throw new Error('Error al crear el tablero');
        }
    }
    async getBoardByProjectId(projectId) {
        try {
            const board = await this.prisma.board.findFirst({
                where: { projectId },
                include: {
                    columns: {
                        orderBy: { position: 'asc' },
                        include: {
                            tasks: {
                                orderBy: { position: 'asc' }
                            }
                        }
                    }
                }
            });
            if (!board) {
                return null;
            }
            return this.mapBoardToResponse(board);
        }
        catch (error) {
            this.logger.error('Error getting board by project ID:', error);
            throw new Error('Error al obtener el tablero del proyecto');
        }
    }
    async updateBoard(boardId, updates) {
        try {
            const updatedBoard = await this.prisma.board.update({
                where: { id: boardId },
                data: {
                    name: updates.name,
                    description: updates.description
                },
                include: {
                    columns: {
                        orderBy: { position: 'asc' },
                        include: {
                            tasks: {
                                orderBy: { position: 'asc' }
                            }
                        }
                    }
                }
            });
            return this.mapBoardToResponse(updatedBoard);
        }
        catch (error) {
            this.logger.error('Error updating board:', error);
            throw new Error('Tablero no encontrado o error al actualizar');
        }
    }
    async deleteBoard(boardId) {
        try {
            await this.prisma.board.delete({
                where: { id: boardId }
            });
        }
        catch (error) {
            this.logger.error('Error deleting board:', error);
            throw new Error('Tablero no encontrado o error al eliminar');
        }
    }
    async createColumn(columnData) {
        try {
            const createdColumn = await this.prisma.column.create({
                data: {
                    boardId: columnData.boardId,
                    title: columnData.title || 'Nueva Columna',
                    position: columnData.position || 0,
                    color: columnData.color || 'gray'
                },
                include: {
                    tasks: {
                        orderBy: { position: 'asc' }
                    }
                }
            });
            return {
                id: createdColumn.id,
                boardId: createdColumn.boardId,
                title: createdColumn.title,
                position: createdColumn.position,
                color: createdColumn.color,
                tasks: [],
                createdAt: createdColumn.createdAt,
                updatedAt: createdColumn.updatedAt
            };
        }
        catch (error) {
            this.logger.error('Error creating column:', error);
            throw new Error('Error al crear la columna');
        }
    }
    async updateColumn(columnId, updates) {
        try {
            const updatedColumn = await this.prisma.column.update({
                where: { id: columnId },
                data: {
                    title: updates.title,
                    position: updates.position,
                    color: updates.color
                },
                include: {
                    tasks: {
                        orderBy: { position: 'asc' }
                    }
                }
            });
            return {
                id: updatedColumn.id,
                boardId: updatedColumn.boardId,
                title: updatedColumn.title,
                position: updatedColumn.position,
                color: updatedColumn.color,
                tasks: [],
                createdAt: updatedColumn.createdAt,
                updatedAt: updatedColumn.updatedAt
            };
        }
        catch (error) {
            this.logger.error('Error updating column:', error);
            throw new Error('Columna no encontrada o error al actualizar');
        }
    }
    async deleteColumn(columnId) {
        try {
            await this.prisma.column.delete({
                where: { id: columnId }
            });
        }
        catch (error) {
            this.logger.error('Error deleting column:', error);
            throw new Error('Columna no encontrada o error al eliminar');
        }
    }
    async reorderColumns(boardId, columnOrders) {
        try {
            for (const order of columnOrders) {
                await this.prisma.column.update({
                    where: { id: order.id },
                    data: { position: order.position }
                });
            }
        }
        catch (error) {
            this.logger.error('Error reordering columns:', error);
            throw new Error('Error al reordenar las columnas');
        }
    }
    async createTask(taskData, actorInfo) {
        try {
            const createdTask = await this.prisma.boardTask.create({
                data: {
                    columnId: taskData.columnId,
                    title: taskData.title || 'Nueva Tarea',
                    description: taskData.description || '',
                    priority: (taskData.priority?.toUpperCase() || 'MEDIUM'),
                    assignedTo: taskData.assignedTo,
                    estimatedHours: taskData.estimatedHours || 1,
                    tags: taskData.tags || [],
                    position: taskData.position || 0,
                    status: taskData.status || 'backlog',
                    createdBy: taskData.createdBy,
                    lastModifiedBy: taskData.createdBy
                }
            });
            return {
                id: createdTask.id,
                columnId: createdTask.columnId,
                title: createdTask.title,
                description: createdTask.description,
                priority: createdTask.priority.toLowerCase(),
                assignedTo: createdTask.assignedTo,
                estimatedHours: createdTask.estimatedHours,
                tags: createdTask.tags,
                position: createdTask.position,
                status: createdTask.status,
                createdAt: createdTask.createdAt,
                updatedAt: createdTask.updatedAt,
                createdBy: createdTask.createdBy,
                lastModifiedBy: createdTask.lastModifiedBy
            };
        }
        catch (error) {
            this.logger.error('Error creating task:', error);
            throw new Error('Error al crear la tarea');
        }
    }
    async getTask(taskId) {
        try {
            const task = await this.prisma.boardTask.findUnique({
                where: { id: taskId }
            });
            if (!task) {
                return null;
            }
            return {
                id: task.id,
                columnId: task.columnId,
                title: task.title,
                description: task.description,
                priority: task.priority.toLowerCase(),
                assignedTo: task.assignedTo,
                estimatedHours: task.estimatedHours,
                tags: task.tags,
                position: task.position,
                status: task.status,
                createdAt: task.createdAt,
                updatedAt: task.updatedAt,
                createdBy: task.createdBy,
                lastModifiedBy: task.lastModifiedBy
            };
        }
        catch (error) {
            this.logger.error('Error getting task:', error);
            throw new Error('Error al obtener la tarea');
        }
    }
    async updateTask(taskId, updates, actorInfo) {
        try {
            const dataToUpdate = {
                title: updates.title,
                description: updates.description,
                assignedTo: updates.assignedTo,
                estimatedHours: updates.estimatedHours,
                tags: updates.tags,
                status: updates.status,
                lastModifiedBy: actorInfo?.id || updates.lastModifiedBy
            };
            if (updates.priority) {
                dataToUpdate.priority = updates.priority.toUpperCase();
            }
            const updatedTask = await this.prisma.boardTask.update({
                where: { id: taskId },
                data: dataToUpdate
            });
            return {
                id: updatedTask.id,
                columnId: updatedTask.columnId,
                title: updatedTask.title,
                description: updatedTask.description,
                priority: updatedTask.priority.toLowerCase(),
                assignedTo: updatedTask.assignedTo,
                estimatedHours: updatedTask.estimatedHours,
                tags: updatedTask.tags,
                position: updatedTask.position,
                status: updatedTask.status,
                createdAt: updatedTask.createdAt,
                updatedAt: updatedTask.updatedAt,
                createdBy: updatedTask.createdBy,
                lastModifiedBy: updatedTask.lastModifiedBy
            };
        }
        catch (error) {
            this.logger.error('Error updating task:', error);
            throw new Error('Tarea no encontrada o error al actualizar');
        }
    }
    async deleteTask(taskId) {
        try {
            await this.prisma.boardTask.delete({
                where: { id: taskId }
            });
        }
        catch (error) {
            this.logger.error('Error deleting task:', error);
            throw new Error('Tarea no encontrada o error al eliminar');
        }
    }
    async moveTask(taskId, targetColumnId, position, actorInfo) {
        try {
            const updatedTask = await this.prisma.boardTask.update({
                where: { id: taskId },
                data: {
                    columnId: targetColumnId,
                    position: position,
                    lastModifiedBy: actorInfo?.id
                }
            });
            return {
                id: updatedTask.id,
                columnId: updatedTask.columnId,
                title: updatedTask.title,
                description: updatedTask.description,
                priority: updatedTask.priority.toLowerCase(),
                assignedTo: updatedTask.assignedTo,
                estimatedHours: updatedTask.estimatedHours,
                tags: updatedTask.tags,
                position: updatedTask.position,
                status: updatedTask.status,
                createdAt: updatedTask.createdAt,
                updatedAt: updatedTask.updatedAt,
                createdBy: updatedTask.createdBy,
                lastModifiedBy: updatedTask.lastModifiedBy
            };
        }
        catch (error) {
            this.logger.error('Error moving task:', error);
            throw new Error('Error al mover la tarea');
        }
    }
    async assignTask(taskId, assignedTo) {
        try {
            const updatedTask = await this.prisma.boardTask.update({
                where: { id: taskId },
                data: { assignedTo }
            });
            return {
                id: updatedTask.id,
                columnId: updatedTask.columnId,
                title: updatedTask.title,
                description: updatedTask.description,
                priority: updatedTask.priority.toLowerCase(),
                assignedTo: updatedTask.assignedTo,
                estimatedHours: updatedTask.estimatedHours,
                tags: updatedTask.tags,
                position: updatedTask.position,
                status: updatedTask.status,
                createdAt: updatedTask.createdAt,
                updatedAt: updatedTask.updatedAt,
                createdBy: updatedTask.createdBy,
                lastModifiedBy: updatedTask.lastModifiedBy
            };
        }
        catch (error) {
            this.logger.error('Error assigning task:', error);
            throw new Error('Error al asignar la tarea');
        }
    }
    async addProjectMember(memberData) {
        throw new Error('Método no implementado - usar MembershipService');
    }
    async getProjectMembers(projectId) {
        return [];
    }
    async updateMemberRole(projectId, userId, role) {
        throw new Error('Método no implementado - usar MembershipService');
    }
    async removeMemberFromProject(projectId, userId) {
        throw new Error('Método no implementado - usar MembershipService');
    }
    async checkMemberPermission(projectId, userId, requiredRole) {
        const result = await this.membershipService.isMember(projectId, userId);
        return result.isMember;
    }
    async addTaskComment(commentData) {
        throw new Error('Método no implementado');
    }
    async getTaskComments(taskId) {
        return [];
    }
    async updateTaskComment(commentId, content, userId) {
        throw new Error('Método no implementado');
    }
    async deleteTaskComment(commentId, userId) {
        throw new Error('Método no implementado');
    }
    async logTaskActivity(activityData) {
        throw new Error('Método no implementado');
    }
    async getTaskActivity(taskId) {
        return [];
    }
    async getBoardActivity(boardId, limit = 50) {
        return [];
    }
    async createDefaultColumns(boardId) {
        const defaultColumnsData = [
            { title: '📋 Product Backlog', color: 'blue', position: 0 },
            { title: '📝 To Do', color: 'orange', position: 1 },
            { title: '🔄 In Progress', color: 'yellow', position: 2 },
            { title: '👀 Review', color: 'purple', position: 3 },
            { title: '✅ Done', color: 'green', position: 4 }
        ];
        const columns = [];
        for (const colData of defaultColumnsData) {
            const column = await this.createColumn({
                boardId,
                ...colData
            });
            columns.push(column);
        }
        return columns;
    }
};
exports.BoardService = BoardService;
exports.BoardService = BoardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => collaboration_gateway_1.CollaborationGateway))),
    __metadata("design:paramtypes", [collaboration_gateway_1.CollaborationGateway,
        membership_service_1.MembershipService,
        logger_service_1.LoggerService,
        prisma_service_1.PrismaService])
], BoardService);
//# sourceMappingURL=board.service.js.map