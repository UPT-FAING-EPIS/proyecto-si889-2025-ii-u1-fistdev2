import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../común/prisma.service';
import { LoggerService } from '../../común/logger.service';
import { NotificationService } from '../notifications/notification.service';
import { v4 as uuidv4 } from 'uuid';

// Importar enums desde el cliente generado de Prisma
const { MemberRole, InvitationStatus } = require('@prisma/client');

// Tipos de los enums para TypeScript
type MemberRole = 'OWNER' | 'MEMBER' | 'VIEWER';
type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';

export interface InviteToProjectDto {
  emails: string[];
  projectId: string;
  role?: MemberRole;
}

export interface ProjectMemberDto {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  role: MemberRole;
  joinedAt: Date;
}

export interface UserProjectDto {
  id: string;
  name: string;
  description?: string;
  role: MemberRole;
  isOwner: boolean;
  memberCount: number;
  lastActivity?: Date;
}

@Injectable()
export class MembershipService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private notificationService: NotificationService,
  ) {}

  /**
   * Invitar usuarios a un proyecto
   */
  async inviteToProject(
    inviterUserId: string,
    dto: InviteToProjectDto,
  ): Promise<{ invited: string[]; alreadyMembers: string[] }> {
    try {
      this.logger.log(`🔄 Invitando usuarios al proyecto ${dto.projectId}`, 'MembershipService');

      // Verificar que el invitador es owner del proyecto
      const membership = await this.prisma.projectMember.findFirst({
        where: {
          projectId: dto.projectId,
          userId: inviterUserId,
          role: MemberRole.OWNER,
        },
      });

      if (!membership) {
        throw new Error('Solo el owner puede invitar usuarios');
      }

      const invited: string[] = [];
      const alreadyMembers: string[] = [];

      for (const email of dto.emails) {
        // Verificar si el usuario ya es miembro
        const user = await this.prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          const existingMember = await this.prisma.projectMember.findFirst({
            where: {
              projectId: dto.projectId,
              userId: user.id,
            },
          });

          if (existingMember) {
            alreadyMembers.push(email);
            continue;
          }

          // Obtener información del proyecto y del invitador
          const project = await this.prisma.project.findUnique({
            where: { id: dto.projectId },
            select: { name: true }
          });

          const inviter = await this.prisma.user.findUnique({
            where: { id: inviterUserId },
            select: { name: true }
          });

          // Crear invitación pendiente en lugar de añadir directamente
          const token = uuidv4();
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

          const invitation = await this.prisma.invitation.create({
            data: {
              projectId: dto.projectId,
              email,
              token,
              invitedBy: inviterUserId,
              expiresAt,
              status: InvitationStatus.PENDING,
            },
          });

          // Crear notificación para el usuario invitado
          await this.notificationService.createProjectInvitationNotification(
            user.id,
            project?.name || 'Proyecto',
            inviter?.name || 'Usuario',
            invitation.id
          );

          // Registrar actividad
          await this.prisma.activity.create({
            data: {
              projectId: dto.projectId,
              userId: inviterUserId,
              action: 'invite_sent',
              payload: {
                invitedEmail: email,
                invitedName: user.name,
                token,
                expiresAt,
              },
            },
          });

          invited.push(email);
        } else {
          // Crear invitación para usuario no registrado
          const token = uuidv4();
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

          await this.prisma.invitation.create({
            data: {
              projectId: dto.projectId,
              email,
              token,
              invitedBy: inviterUserId,
              expiresAt,
              status: InvitationStatus.PENDING,
            },
          });

          // Registrar actividad
          await this.prisma.activity.create({
            data: {
              projectId: dto.projectId,
              userId: inviterUserId,
              action: 'invite_sent',
              payload: {
                invitedEmail: email,
                token,
                expiresAt,
              },
            },
          });

          invited.push(email);
        }
      }

      // Marcar proyecto como compartido si tiene miembros
      if (invited.length > 0) {
        await this.prisma.project.update({
          where: { id: dto.projectId },
          data: { isShared: true },
        });
      }

      this.logger.log(`✅ Invitaciones enviadas: ${invited.length}, Ya miembros: ${alreadyMembers.length}`, 'MembershipService');

      return { invited, alreadyMembers };
    } catch (error) {
      this.logger.error(`Error invitando usuarios: ${error.message}`, error.stack, 'MembershipService');
      throw error;
    }
  }

  /**
   * Listar miembros de un proyecto
   */
  async getProjectMembers(projectId: string, userId: string): Promise<ProjectMemberDto[]> {
    try {
      // Verificar que el usuario es miembro del proyecto
      const userMembership = await this.prisma.projectMember.findFirst({
        where: {
          projectId,
          userId,
        },
      });

      if (!userMembership) {
        throw new Error('No tienes acceso a este proyecto');
      }

      const members = await this.prisma.projectMember.findMany({
        where: { projectId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: [
          { role: 'asc' }, // OWNER primero
          { joinedAt: 'asc' },
        ],
      });

      return members.map(member => ({
        id: member.id,
        userId: member.userId,
        user: member.user,
        role: member.role,
        joinedAt: member.joinedAt,
      }));
    } catch (error) {
      this.logger.error(`Error obteniendo miembros del proyecto: ${error.message}`, error.stack, 'MembershipService');
      throw error;
    }
  }

  /**
   * Remover miembro de un proyecto
   */
  async removeMember(projectId: string, memberUserId: string, ownerUserId: string): Promise<void> {
    try {
      this.logger.log(`🔄 Removiendo miembro ${memberUserId} del proyecto ${projectId}`, 'MembershipService');

      // Verificar que quien remueve es owner
      const ownerMembership = await this.prisma.projectMember.findFirst({
        where: {
          projectId,
          userId: ownerUserId,
          role: MemberRole.OWNER,
        },
      });

      if (!ownerMembership) {
        throw new Error('Solo el owner puede remover miembros');
      }

      // No permitir remover al owner
      const memberToRemove = await this.prisma.projectMember.findFirst({
        where: {
          projectId,
          userId: memberUserId,
        },
        include: {
          user: true,
        },
      });

      if (!memberToRemove) {
        throw new Error('Miembro no encontrado');
      }

      if (memberToRemove.role === MemberRole.OWNER) {
        throw new Error('No se puede remover al owner del proyecto');
      }

      // Remover miembro
      await this.prisma.projectMember.delete({
        where: {
          id: memberToRemove.id,
        },
      });

      // Registrar actividad
      await this.prisma.activity.create({
        data: {
          projectId,
          userId: ownerUserId,
          action: 'member_removed',
          payload: {
            removedMemberEmail: memberToRemove.user.email,
            removedMemberName: memberToRemove.user.name,
            role: memberToRemove.role,
          },
        },
      });

      this.logger.log(`✅ Miembro removido exitosamente`, 'MembershipService');
    } catch (error) {
      this.logger.error(`Error removiendo miembro: ${error.message}`, error.stack, 'MembershipService');
      throw error;
    }
  }

  /**
   * Aceptar invitación
   */
  async acceptInvitation(token: string, userId: string): Promise<{ projectId: string; projectName: string }> {
    try {
      this.logger.log(`🔄 Aceptando invitación con token ${token}`, 'MembershipService');

      const invitation = await this.prisma.invitation.findUnique({
        where: { token },
        include: {
          project: true,
        },
      });

      if (!invitation) {
        throw new Error('Invitación no encontrada');
      }

      if (invitation.status !== InvitationStatus.PENDING) {
        throw new Error('Invitación ya procesada');
      }

      if (invitation.expiresAt < new Date()) {
        throw new Error('Invitación expirada');
      }

      // Verificar que el email coincide
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.email !== invitation.email) {
        throw new Error('Email no coincide con la invitación');
      }

      // Crear membresía
      await this.prisma.projectMember.create({
        data: {
          projectId: invitation.projectId,
          userId,
          role: MemberRole.MEMBER,
        },
      });

      // Actualizar invitación
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.ACCEPTED },
      });

      // Crear notificación para el invitador
      const inviter = await this.prisma.user.findUnique({
        where: { id: invitation.invitedBy },
        select: { id: true }
      });

      if (inviter) {
        await this.notificationService.createInvitationAcceptedNotification(
          inviter.id,
          invitation.project.name,
          user.name
        );
      }

      // Registrar actividad
      await this.prisma.activity.create({
        data: {
          projectId: invitation.projectId,
          userId,
          action: 'member_joined',
          payload: {
            memberEmail: user.email,
            memberName: user.name,
            invitationToken: token,
          },
        },
      });

      this.logger.log(`✅ Invitación aceptada exitosamente`, 'MembershipService');

      return {
        projectId: invitation.projectId,
        projectName: invitation.project.name,
      };
    } catch (error) {
      this.logger.error(`Error aceptando invitación: ${error.message}`, error.stack, 'MembershipService');
      throw error;
    }
  }

  /**
   * Obtener proyectos del usuario (propios y compartidos)
   */
  async getUserProjects(userId: string): Promise<UserProjectDto[]> {
    try {
      const memberships = await this.prisma.projectMember.findMany({
        where: { userId },
        include: {
          project: {
            include: {
              _count: {
                select: {
                  members: true,
                },
              },
              activities: {
                take: 1,
                orderBy: { createdAt: 'desc' },
              },
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      });

      return memberships.map(membership => ({
        id: membership.project.id,
        name: membership.project.name,
        description: membership.project.description,
        role: membership.role,
        isOwner: membership.role === MemberRole.OWNER,
        memberCount: membership.project._count.members,
        lastActivity: membership.project.activities[0]?.createdAt,
      }));
    } catch (error) {
      this.logger.error(`Error obteniendo proyectos del usuario: ${error.message}`, error.stack, 'MembershipService');
      throw error;
    }
  }

  /**
   * Verificar si un usuario es miembro de un proyecto
   */
  async isMember(projectId: string, userId: string): Promise<{ isMember: boolean; role?: MemberRole }> {
    try {
      const membership = await this.prisma.projectMember.findFirst({
        where: {
          projectId,
          userId,
        },
      });

      return {
        isMember: !!membership,
        role: membership?.role,
      };
    } catch (error) {
      this.logger.error(`Error verificando membresía: ${error.message}`, error.stack, 'MembershipService');
      return { isMember: false };
    }
  }

  /**
   * Obtener invitaciones pendientes
   */
  async getPendingInvitations(email: string): Promise<any[]> {
    try {
      const invitations = await this.prisma.invitation.findMany({
        where: {
          email,
          status: InvitationStatus.PENDING,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          inviter: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return invitations;
    } catch (error) {
      this.logger.error(`Error obteniendo invitaciones pendientes: ${error.message}`, error.stack, 'MembershipService');
      throw error;
    }
  }

  /**
   * Limpiar invitaciones expiradas (worker task)
   */
  async cleanupExpiredInvitations(): Promise<number> {
    try {
      const result = await this.prisma.invitation.updateMany({
        where: {
          status: InvitationStatus.PENDING,
          expiresAt: {
            lt: new Date(),
          },
        },
        data: {
          status: InvitationStatus.EXPIRED,
        },
      });

      this.logger.log(`🧹 ${result.count} invitaciones marcadas como expiradas`, 'MembershipService');
      return result.count;
    } catch (error) {
      this.logger.error(`Error limpiando invitaciones expiradas: ${error.message}`, error.stack, 'MembershipService');
      return 0;
    }
  }



  /**
   * Rechazar invitación a proyecto
   */
  async rejectInvitation(invitationId: string, userId: string): Promise<any> {
    try {
      this.logger.log(`🔄 Rechazando invitación ${invitationId} para usuario ${userId}`, 'MembershipService');

      // Buscar la invitación
      const invitation = await this.prisma.invitation.findUnique({
        where: { id: invitationId },
        include: {
          project: { select: { name: true } },
          inviter: { select: { id: true, name: true } }
        }
      });

      if (!invitation) {
        throw new Error('Invitación no encontrada');
      }

      if (invitation.status !== InvitationStatus.PENDING) {
        throw new Error('La invitación ya ha sido procesada');
      }

      // Verificar que el usuario corresponde al email de la invitación
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true }
      });

      if (!user || user.email !== invitation.email) {
        throw new Error('No tienes permisos para rechazar esta invitación');
      }

      // Actualizar invitación como rechazada
      await this.prisma.invitation.update({
        where: { id: invitationId },
        data: { status: InvitationStatus.REVOKED },
      });

      // Crear notificación para el invitador
      await this.notificationService.createInvitationRejectedNotification(
        invitation.inviter.id,
        invitation.project.name,
        user.name
      );

      // Registrar actividad
      await this.prisma.activity.create({
        data: {
          projectId: invitation.projectId,
          userId: userId,
          action: 'invitation_rejected',
          payload: {
            invitationId,
            memberName: user.name,
            memberEmail: user.email,
          },
        },
      });

      this.logger.log(`✅ Invitación rechazada exitosamente`, 'MembershipService');

      return {
        success: true,
        message: 'Invitación rechazada'
      };

    } catch (error) {
      this.logger.error(`Error rechazando invitación: ${error.message}`, error.stack, 'MembershipService');
      throw error;
    }
  }

  /**
   * Obtener invitaciones pendientes de un usuario
   */
  async getUserPendingInvitations(userId: string): Promise<any[]> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return this.getPendingInvitations(user.email);
    } catch (error) {
      this.logger.error(`Error obteniendo invitaciones del usuario: ${error.message}`, error.stack, 'MembershipService');
      throw error;
    }
  }
}
