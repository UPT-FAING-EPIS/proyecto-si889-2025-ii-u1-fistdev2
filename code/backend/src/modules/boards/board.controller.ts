import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { Board, Column, Task, ProjectMember, TaskComment } from '../../dominio/entidades/board';

@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  // ==================== TEST ENDPOINT ====================
  
  @Get('test')
  getTest() {
    try {
      return { 
        message: 'Board API funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        status: 'OK'
      };
    } catch (error) {
      throw new HttpException(
        `Error en test: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ==================== BOARD ENDPOINTS ====================
  
  @Get('project/:projectId')
  async getBoardByProject(@Param('projectId') projectId: string) {
    try {
      const board = await this.boardService.getBoardByProjectId(projectId);
      return {
        success: true,
        data: board
      };
    } catch (error) {
      throw new HttpException(
        `Error obteniendo tablero: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('project/:projectId')
  async createBoard(
    @Param('projectId') projectId: string,
    @Body() createBoardDto: { name: string; description?: string }
  ) {
    try {
      // Para testing, usar un userId temporal
      const testUserId = 'test-user-123';
      
      const board = await this.boardService.createBoard({
        projectId,
        name: createBoardDto.name,
        description: createBoardDto.description || '',
        createdBy: testUserId
      });

      return {
        success: true,
        data: board
      };
    } catch (error) {
      throw new HttpException(
        `Error creando tablero: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ==================== COLUMN ENDPOINTS ====================

  @Post(':boardId/columns')
  async createColumn(
    @Param('boardId') boardId: string,
    @Body() createColumnDto: { title: string; position: number; color?: string }
  ) {
    try {
      const column = await this.boardService.createColumn({
        boardId,
        title: createColumnDto.title,
        position: createColumnDto.position,
        color: createColumnDto.color || 'blue',
        tasks: []
      });

      return {
        success: true,
        data: column
      };
    } catch (error) {
      throw new HttpException(
        `Error creando columna: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ==================== TASK ENDPOINTS ====================

  @Get('tasks/:taskId')
  async getTask(@Param('taskId') taskId: string) {
    try {
      const task = await this.boardService.getTask(taskId);
      return {
        success: true,
        data: task
      };
    } catch (error) {
      throw new HttpException(
        `Error obteniendo tarea: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('columns/:columnId/tasks')
  async createTask(
    @Param('columnId') columnId: string,
    @Body() createTaskDto: { 
      title: string; 
      description?: string; 
      priority?: 'low' | 'medium' | 'high';
      assignedTo?: string;
    }
  ) {
    try {
      // Para testing, usar un userId temporal
      const testUserId = 'test-user-123';
      
      const task = await this.boardService.createTask({
        columnId,
        title: createTaskDto.title,
        description: createTaskDto.description || '',
        priority: createTaskDto.priority || 'medium',
        assignedTo: createTaskDto.assignedTo,
        createdBy: testUserId,
        position: 0
      });

      return {
        success: true,
        data: task
      };
    } catch (error) {
      throw new HttpException(
        `Error creando tarea: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('tasks/:taskId/move')
  async moveTask(
    @Param('taskId') taskId: string,
    @Body() moveTaskDto: { targetColumnId: string; position: number }
  ) {
    try {
      const result = await this.boardService.moveTask(
        taskId,
        moveTaskDto.targetColumnId,
        moveTaskDto.position
      );

      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw new HttpException(
        `Error moviendo tarea: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ==================== PROJECT MEMBER ENDPOINTS ====================

  @Get('project/:projectId/members')
  async getProjectMembers(@Param('projectId') projectId: string) {
    try {
      const members = await this.boardService.getProjectMembers(projectId);
      return {
        success: true,
        data: members
      };
    } catch (error) {
      throw new HttpException(
        `Error obteniendo miembros: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('project/:projectId/members')
  async addProjectMember(
    @Param('projectId') projectId: string,
    @Body() addMemberDto: { 
      userId: string; 
      role: 'owner' | 'admin' | 'member' | 'viewer';
      invitedBy?: string;
    }
  ) {
    try {
      // Para testing, usar un userId temporal para invitedBy
      const testUserId = 'test-user-123';
      
      // Validar que no se pueda asignar el rol 'owner' a través de este endpoint
      // Solo se permite 'member', 'admin' o 'viewer'
      let validatedRole = addMemberDto.role;
      if (addMemberDto.role === 'owner') {
        validatedRole = 'member'; // Forzar a 'member' si intentan asignar 'owner'
      }
      
      const member = await this.boardService.addProjectMember({
        projectId,
        userId: addMemberDto.userId,
        role: validatedRole,
        invitedBy: addMemberDto.invitedBy || testUserId
      });

      return {
        success: true,
        data: member
      };
    } catch (error) {
      throw new HttpException(
        `Error añadiendo miembro: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}