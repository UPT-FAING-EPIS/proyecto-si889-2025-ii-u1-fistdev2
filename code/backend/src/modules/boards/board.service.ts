import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { IBoardService } from '../../dominio/interfaces/board.interface';
import { Board, Column, Task, ProjectMember, TaskComment, TaskActivity } from '../../dominio/entidades/board';
import { CollaborationGateway } from '../collaboration/collaboration.gateway';
import { MembershipService } from '../membership/membership.service';
import { LoggerService } from '../../común/logger.service';
import { PrismaService } from '../../común/prisma.service';

@Injectable()
export class BoardService implements IBoardService {
  constructor(
    @Inject(forwardRef(() => CollaborationGateway))
    private readonly collaborationGateway: CollaborationGateway,
    private readonly membershipService: MembershipService,
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
  ) {}

  private async validateProjectMembership(projectId: string, userId: string): Promise<void> {
    const result = await this.membershipService.isMember(projectId, userId);
    const isMember = result.isMember;
    if (!isMember) {
      throw new Error('No tienes permisos para acceder a este proyecto');
    }
  }

  private async emitBoardEvent(
    projectId: string, 
    eventType: string, 
    actor: { id: string; email: string; name: string },
    payload: any
  ): Promise<void> {
    try {
      await this.collaborationGateway.emitBoardEvent('project:' + projectId, {
        type: eventType,
        projectId,
        actor,
        payload,
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.error('Error emitting board event:', error);
    }
  }

  private mapBoardToResponse(board: any): Board {
    return {
      id: board.id,
      projectId: board.projectId,
      name: board.name,
      description: board.description,
      columns: board.columns?.map((column: any) => ({
        id: column.id,
        boardId: column.boardId,
        title: column.title,
        position: column.position,
        color: column.color,
        tasks: column.tasks?.map((task: any) => ({
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

  // Board Management
  async createBoard(boardData: Partial<Board>): Promise<Board> {
    try {
      const createdBoard = await this.prisma.board.create({
        data: {
          projectId: boardData.projectId!,
          name: boardData.name || 'Nuevo Tablero',
          description: boardData.description,
          createdBy: boardData.createdBy!
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

      // Crear columnas por defecto si no existen
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

        return this.mapBoardToResponse(boardWithColumns!);
      }

      return this.mapBoardToResponse(createdBoard);
    } catch (error) {
      this.logger.error('Error creating board:', error);
      throw new Error('Error al crear el tablero');
    }
  }

  async getBoardByProjectId(projectId: string): Promise<Board | null> {
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
    } catch (error) {
      this.logger.error('Error getting board by project ID:', error);
      throw new Error('Error al obtener el tablero del proyecto');
    }
  }

  async updateBoard(boardId: string, updates: Partial<Board>): Promise<Board> {
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
    } catch (error) {
      this.logger.error('Error updating board:', error);
      throw new Error('Tablero no encontrado o error al actualizar');
    }
  }

  async deleteBoard(boardId: string): Promise<void> {
    try {
      await this.prisma.board.delete({
        where: { id: boardId }
      });
    } catch (error) {
      this.logger.error('Error deleting board:', error);
      throw new Error('Tablero no encontrado o error al eliminar');
    }
  }

  // Column Management
  async createColumn(columnData: Partial<Column>): Promise<Column> {
    try {
      const createdColumn = await this.prisma.column.create({
        data: {
          boardId: columnData.boardId!,
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
    } catch (error) {
      this.logger.error('Error creating column:', error);
      throw new Error('Error al crear la columna');
    }
  }

  async updateColumn(columnId: string, updates: Partial<Column>): Promise<Column> {
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
    } catch (error) {
      this.logger.error('Error updating column:', error);
      throw new Error('Columna no encontrada o error al actualizar');
    }
  }

  async deleteColumn(columnId: string): Promise<void> {
    try {
      await this.prisma.column.delete({
        where: { id: columnId }
      });
    } catch (error) {
      this.logger.error('Error deleting column:', error);
      throw new Error('Columna no encontrada o error al eliminar');
    }
  }

  async reorderColumns(boardId: string, columnOrders: { id: string; position: number }[]): Promise<void> {
    try {
      for (const order of columnOrders) {
        await this.prisma.column.update({
          where: { id: order.id },
          data: { position: order.position }
        });
      }
    } catch (error) {
      this.logger.error('Error reordering columns:', error);
      throw new Error('Error al reordenar las columnas');
    }
  }

  // Task Management
  async createTask(taskData: Partial<Task>, actorInfo?: { id: string; email: string; name: string }): Promise<Task> {
    try {
      const createdTask = await this.prisma.boardTask.create({
        data: {
          columnId: taskData.columnId!,
          title: taskData.title || 'Nueva Tarea',
          description: taskData.description || '',
          priority: (taskData.priority?.toUpperCase() || 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH',
          assignedTo: taskData.assignedTo,
          estimatedHours: taskData.estimatedHours || 1,
          tags: taskData.tags || [],
          position: taskData.position || 0,
          status: taskData.status || 'backlog',
          createdBy: taskData.createdBy!,
          lastModifiedBy: taskData.createdBy!
        }
      });

      return {
        id: createdTask.id,
        columnId: createdTask.columnId,
        title: createdTask.title,
        description: createdTask.description,
        priority: createdTask.priority.toLowerCase() as 'low' | 'medium' | 'high',
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
    } catch (error) {
      this.logger.error('Error creating task:', error);
      throw new Error('Error al crear la tarea');
    }
  }

  async getTask(taskId: string): Promise<Task | null> {
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
        priority: task.priority.toLowerCase() as 'low' | 'medium' | 'high',
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
    } catch (error) {
      this.logger.error('Error getting task:', error);
      throw new Error('Error al obtener la tarea');
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>, actorInfo?: { id: string; email: string; name: string }): Promise<Task> {
    try {
      const dataToUpdate: any = {
        title: updates.title,
        description: updates.description,
        assignedTo: updates.assignedTo,
        estimatedHours: updates.estimatedHours,
        tags: updates.tags,
        status: updates.status,
        lastModifiedBy: actorInfo?.id || updates.lastModifiedBy
      };
      
      if (updates.priority) {
        dataToUpdate.priority = updates.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH';
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
        priority: updatedTask.priority.toLowerCase() as 'low' | 'medium' | 'high',
        assignedTo: updatedTask.assignedTo,
        estimatedHours: updatedTask.estimatedHours,
        tags: updatedTask.tags as string[],
        position: updatedTask.position,
        status: updatedTask.status,
        createdAt: updatedTask.createdAt,
        updatedAt: updatedTask.updatedAt,
        createdBy: updatedTask.createdBy,
        lastModifiedBy: updatedTask.lastModifiedBy
      };
    } catch (error) {
      this.logger.error('Error updating task:', error);
      throw new Error('Tarea no encontrada o error al actualizar');
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      await this.prisma.boardTask.delete({
        where: { id: taskId }
      });
    } catch (error) {
      this.logger.error('Error deleting task:', error);
      throw new Error('Tarea no encontrada o error al eliminar');
    }
  }

  async moveTask(taskId: string, targetColumnId: string, position: number, actorInfo?: { id: string; email: string; name: string }): Promise<Task> {
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
        priority: updatedTask.priority.toLowerCase() as 'low' | 'medium' | 'high',
        assignedTo: updatedTask.assignedTo,
        estimatedHours: updatedTask.estimatedHours,
        tags: updatedTask.tags as string[],
        position: updatedTask.position,
        status: updatedTask.status,
        createdAt: updatedTask.createdAt,
        updatedAt: updatedTask.updatedAt,
        createdBy: updatedTask.createdBy,
        lastModifiedBy: updatedTask.lastModifiedBy
      };
    } catch (error) {
      this.logger.error('Error moving task:', error);
      throw new Error('Error al mover la tarea');
    }
  }

  async assignTask(taskId: string, assignedTo: string): Promise<Task> {
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
        priority: updatedTask.priority.toLowerCase() as 'low' | 'medium' | 'high',
        assignedTo: updatedTask.assignedTo,
        estimatedHours: updatedTask.estimatedHours,
        tags: updatedTask.tags as string[],
        position: updatedTask.position,
        status: updatedTask.status,
        createdAt: updatedTask.createdAt,
        updatedAt: updatedTask.updatedAt,
        createdBy: updatedTask.createdBy,
        lastModifiedBy: updatedTask.lastModifiedBy
      };
    } catch (error) {
      this.logger.error('Error assigning task:', error);
      throw new Error('Error al asignar la tarea');
    }
  }

  // Métodos simplificados para miembros del proyecto
  async addProjectMember(memberData: Partial<ProjectMember>): Promise<ProjectMember> {
    // Implementación simplificada - delegar al MembershipService
    throw new Error('Método no implementado - usar MembershipService');
  }

  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    // Implementación simplificada - delegar al MembershipService
    return [];
  }

  async updateMemberRole(projectId: string, userId: string, role: ProjectMember['role']): Promise<ProjectMember> {
    // Implementación simplificada - delegar al MembershipService
    throw new Error('Método no implementado - usar MembershipService');
  }

  async removeMemberFromProject(projectId: string, userId: string): Promise<void> {
    // Implementación simplificada - delegar al MembershipService
    throw new Error('Método no implementado - usar MembershipService');
  }

  async checkMemberPermission(projectId: string, userId: string, requiredRole?: string): Promise<boolean> {
    const result = await this.membershipService.isMember(projectId, userId);
    return result.isMember;
  }

  // Métodos simplificados para comentarios y actividades
  async addTaskComment(commentData: Partial<TaskComment>): Promise<TaskComment> {
    throw new Error('Método no implementado');
  }

  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    return [];
  }

  async updateTaskComment(commentId: string, content: string, userId: string): Promise<TaskComment> {
    throw new Error('Método no implementado');
  }

  async deleteTaskComment(commentId: string, userId: string): Promise<void> {
    throw new Error('Método no implementado');
  }

  async logTaskActivity(activityData: Partial<TaskActivity>): Promise<TaskActivity> {
    throw new Error('Método no implementado');
  }

  async getTaskActivity(taskId: string): Promise<TaskActivity[]> {
    return [];
  }

  async getBoardActivity(boardId: string, limit: number = 50): Promise<TaskActivity[]> {
    return [];
  }

  private async createDefaultColumns(boardId: string): Promise<Column[]> {
    const defaultColumnsData = [
      { title: '📋 Product Backlog', color: 'blue', position: 0 },
      { title: '📝 To Do', color: 'orange', position: 1 },
      { title: '🔄 In Progress', color: 'yellow', position: 2 },
      { title: '👀 Review', color: 'purple', position: 3 },
      { title: '✅ Done', color: 'green', position: 4 }
    ];

    const columns: Column[] = [];
    for (const colData of defaultColumnsData) {
      const column = await this.createColumn({
        boardId,
        ...colData
      });
      columns.push(column);
    }

    return columns;
  }
}