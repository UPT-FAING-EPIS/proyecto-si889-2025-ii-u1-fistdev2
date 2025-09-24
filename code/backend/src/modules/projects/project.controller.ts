import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpStatus, HttpException } from '@nestjs/common';
import { ProjectService } from './project.service';
import { BoardService } from '../boards/board.service';
import { CreateProjectDto, UpdateProjectDto } from '../../dominio/project.dto';
import { JwtAuthGuard } from '../../común/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly boardService: BoardService
  ) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    try {
      const userId = req.user.userId;
      const project = await this.projectService.create(createProjectDto, userId);
      
      // Agregar automáticamente al creador como owner del proyecto
      // TODO: Implementar usando MembershipService
      /*
      await this.boardService.addProjectMember({
        projectId: project.id,
        userId: userId,
        role: 'owner',
        invitedBy: userId,
        user: {
          id: userId,
          name: req.user.username || `Usuario ${userId}`,
          email: req.user.email || `${userId}@devflow.com`
        }
      });
      */
      
      return {
        success: true,
        message: 'Proyecto creado exitosamente',
        data: project
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: 'Error al crear el proyecto',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll(@Request() req) {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user || !req.user.userId) {
        throw new HttpException({
          success: false,
          message: 'Usuario no autenticado'
        }, HttpStatus.UNAUTHORIZED);
      }

      const userId = req.user.userId;
      const userRole = req.user.role;
      
      // Obtener proyectos del usuario (incluyendo aquellos donde es miembro)
      const projects = await this.projectService.findAll(userId);

      return {
        success: true,
        message: 'Proyectos obtenidos exitosamente',
        data: projects
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: 'Error al obtener proyectos',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('statistics')
  async getStatistics(@Request() req) {
    try {
      const userId = req.user.userId;
      const statistics = await this.projectService.getStatistics(userId);
      
      return {
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: statistics
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('board-test')
  async boardTest(@Request() req) {
    try {
      // Crear un tablero de prueba
      const testBoard = await this.boardService.createBoard({
        projectId: 'test-project-' + Date.now(),
        name: 'Tablero de Prueba',
        description: 'Tablero creado para probar la funcionalidad',
        createdBy: req.user.userId || 'test-user'
      });
      
      return {
        success: true,
        message: 'BoardService funcionando correctamente desde ProjectController',
        data: {
          boardCreated: true,
          boardId: testBoard.id,
          boardName: testBoard.name,
          columnsCount: testBoard.columns?.length || 0,
          projectId: testBoard.projectId
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException({
        success: false,
        message: `Error probando BoardService: ${error.message}`,
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    try {
      const userId = req.user.userId;
      const project = await this.projectService.findOne(id, userId);

      return {
        success: true,
        message: 'Proyecto obtenido exitosamente',
        data: project
      };
    } catch (error) {
      if (error.message === 'Proyecto no encontrado') {
        throw new HttpException({
          success: false,
          message: 'Proyecto no encontrado o acceso denegado'
        }, HttpStatus.NOT_FOUND);
      }
      
      throw new HttpException({
        success: false,
        message: 'Error al obtener el proyecto',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @Request() req) {
    try {
      const userId = req.user.userId;
      const project = await this.projectService.update(id, updateProjectDto, userId);

      return {
        success: true,
        message: 'Proyecto actualizado exitosamente',
        data: project
      };
    } catch (error) {
      if (error.message.includes('no encontrado') || error.message.includes('sin permisos')) {
        throw new HttpException({
          success: false,
          message: 'Proyecto no encontrado o acceso denegado'
        }, HttpStatus.NOT_FOUND);
      }
      
      throw new HttpException({
        success: false,
        message: 'Error al actualizar el proyecto',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    try {
      const userId = req.user.userId;
      const deleted = await this.projectService.remove(id, userId);
      
      if (!deleted) {
        throw new HttpException({
          success: false,
          message: 'Proyecto no encontrado o acceso denegado'
        }, HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        message: 'Proyecto eliminado exitosamente'
      };
    } catch (error) {
      if (error.message.includes('no encontrado') || error.message.includes('sin permisos')) {
        throw new HttpException({
          success: false,
          message: 'Proyecto no encontrado o acceso denegado'
        }, HttpStatus.NOT_FOUND);
      }
      
      throw new HttpException({
        success: false,
        message: 'Error al eliminar el proyecto',
        error: error.message
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
