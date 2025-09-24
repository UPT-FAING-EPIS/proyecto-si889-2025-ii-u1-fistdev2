import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../común/guards/jwt-auth.guard';
import { MembershipService, InviteToProjectDto } from './membership.service';
import { LoggerService } from '../../común/logger.service';

@ApiTags('Project Membership')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('membership')
export class MembershipController {
  constructor(
    private membershipService: MembershipService,
    private logger: LoggerService,
  ) {}

  @Post(':projectId/invite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Invitar usuarios a un proyecto',
    description: 'Invita usuarios por email a un proyecto. Solo el owner puede invitar.',
  })
  @ApiResponse({
    status: 200,
    description: 'Invitaciones enviadas exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            invited: { type: 'array', items: { type: 'string' } },
            alreadyMembers: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Solo el owner puede invitar' })
  async inviteToProject(
    @Param('projectId') projectId: string,
    @Body() body: { emails: string[]; role?: string },
    @Request() req: any,
  ) {
    try {
      this.logger.log(`🔄 Invitando usuarios al proyecto: ${projectId}`, 'MembershipController');

      const dto: InviteToProjectDto = {
        projectId,
        emails: body.emails,
        role: body.role as any || 'MEMBER',
      };

      const result = await this.membershipService.inviteToProject(req.user.id, dto);

      return {
        success: true,
        data: result,
        message: `${result.invited.length} invitaciones enviadas`,
      };
    } catch (error) {
      this.logger.error(`Error en inviteToProject: ${error.message}`, error.stack, 'MembershipController');
      throw error;
    }
  }

  @Get(':projectId/members')
  @ApiOperation({
    summary: 'Listar miembros del proyecto',
    description: 'Obtiene la lista de todos los miembros del proyecto con sus roles',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de miembros obtenida exitosamente',
  })
  async getProjectMembers(
    @Param('projectId') projectId: string,
    @Request() req: any,
  ) {
    try {
      this.logger.log(`🔄 Obteniendo miembros del proyecto: ${projectId}`, 'MembershipController');

      const members = await this.membershipService.getProjectMembers(projectId, req.user.id);

      return {
        success: true,
        data: members,
        total: members.length,
      };
    } catch (error) {
      this.logger.error(`Error en getProjectMembers: ${error.message}`, error.stack, 'MembershipController');
      throw error;
    }
  }

  @Delete(':projectId/members/:memberId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remover miembro del proyecto',
    description: 'Remueve un miembro del proyecto. Solo el owner puede remover miembros.',
  })
  @ApiResponse({
    status: 200,
    description: 'Miembro removido exitosamente',
  })
  @ApiResponse({ status: 403, description: 'Solo el owner puede remover miembros' })
  async removeMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @Request() req: any,
  ) {
    try {
      this.logger.log(`🔄 Removiendo miembro ${memberId} del proyecto: ${projectId}`, 'MembershipController');

      await this.membershipService.removeMember(projectId, memberId, req.user.id);

      return {
        success: true,
        message: 'Miembro removido exitosamente',
      };
    } catch (error) {
      this.logger.error(`Error en removeMember: ${error.message}`, error.stack, 'MembershipController');
      throw error;
    }
  }

  @Post('invitations/:token/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Aceptar invitación a proyecto',
    description: 'Acepta una invitación usando el token recibido',
  })
  @ApiResponse({
    status: 200,
    description: 'Invitación aceptada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  async acceptInvitation(
    @Param('token') token: string,
    @Request() req: any,
  ) {
    try {
      this.logger.log(`🔄 Aceptando invitación con token: ${token}`, 'MembershipController');

      const result = await this.membershipService.acceptInvitation(token, req.user.id);

      return {
        success: true,
        data: result,
        message: `Te has unido al proyecto: ${result.projectName}`,
      };
    } catch (error) {
      this.logger.error(`Error en acceptInvitation: ${error.message}`, error.stack, 'MembershipController');
      throw error;
    }
  }

  @Get('my-projects')
  @ApiOperation({
    summary: 'Obtener proyectos del usuario',
    description: 'Obtiene todos los proyectos donde el usuario es miembro (propios y compartidos)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de proyectos obtenida exitosamente',
  })
  async getUserProjects(@Request() req: any) {
    try {
      this.logger.log(`🔄 Obteniendo proyectos del usuario: ${req.user.id}`, 'MembershipController');

      const projects = await this.membershipService.getUserProjects(req.user.id);

      return {
        success: true,
        data: projects,
        total: projects.length,
      };
    } catch (error) {
      this.logger.error(`Error en getUserProjects: ${error.message}`, error.stack, 'MembershipController');
      throw error;
    }
  }

  @Get('invitations')
  @ApiOperation({
    summary: 'Obtener invitaciones pendientes',
    description: 'Obtiene las invitaciones pendientes para el usuario actual',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de invitaciones pendientes',
  })
  async getPendingInvitations(@Request() req: any) {
    try {
      this.logger.log(`🔄 Obteniendo invitaciones pendientes para: ${req.user.email}`, 'MembershipController');

      const invitations = await this.membershipService.getPendingInvitations(req.user.email);

      return {
        success: true,
        data: invitations,
        total: invitations.length,
      };
    } catch (error) {
      this.logger.error(`Error en getPendingInvitations: ${error.message}`, error.stack, 'MembershipController');
      throw error;
    }
  }

  @Get(':projectId/check-membership')
  @ApiOperation({
    summary: 'Verificar membresía en proyecto',
    description: 'Verifica si el usuario actual es miembro del proyecto',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de membresía verificado',
  })
  async checkMembership(
    @Param('projectId') projectId: string,
    @Request() req: any,
  ) {
    try {
      const result = await this.membershipService.isMember(projectId, req.user.id);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error en checkMembership: ${error.message}`, error.stack, 'MembershipController');
      throw error;
    }
  }

  @Get('invitations/me')
  @ApiOperation({
    summary: 'Obtener invitaciones pendientes del usuario',
    description: 'Obtiene todas las invitaciones pendientes del usuario autenticado',
  })
  async getMyInvitations(@Request() req: any) {
    try {
      const invitations = await this.membershipService.getUserPendingInvitations(req.user.id);

      return {
        success: true,
        data: invitations,
      };
    } catch (error) {
      this.logger.error(`Error obteniendo invitaciones: ${error.message}`, error.stack, 'MembershipController');
      throw error;
    }
  }



  @Post('invitations/:invitationId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rechazar invitación a proyecto',
    description: 'Rechaza una invitación pendiente',
  })
  async rejectInvitation(
    @Param('invitationId') invitationId: string,
    @Request() req: any,
  ) {
    try {
      const result = await this.membershipService.rejectInvitation(invitationId, req.user.id);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Error rechazando invitación: ${error.message}`, error.stack, 'MembershipController');
      throw error;
    }
  }
}
