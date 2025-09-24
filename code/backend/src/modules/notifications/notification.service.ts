import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../común/prisma.service';

export interface CreateNotificationDto {
  userId: string;
  type: 'PROJECT_INVITATION' | 'INVITATION_ACCEPTED' | 'INVITATION_REJECTED' | 'MEMBER_ADDED' | 'MEMBER_REMOVED' | 'PROJECT_SHARED' | 'TASK_ASSIGNED' | 'TASK_COMPLETED' | 'COMMENT_ADDED';
  title: string;
  message: string;
  data?: any;
}

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  // Crear una nueva notificación
  async createNotification(createDto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: createDto.userId,
        type: createDto.type,
        title: createDto.title,
        message: createDto.message,
        data: createDto.data || {},
      },
    });
  }

  // Obtener todas las notificaciones de un usuario
  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Obtener notificaciones no leídas
  async getUnreadNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { 
        userId,
        read: false 
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Marcar notificación como leída
  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { 
        id: notificationId,
        userId 
      },
      data: { read: true },
    });
  }

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { 
        userId,
        read: false 
      },
      data: { read: true },
    });
  }

  // Eliminar notificación
  async deleteNotification(notificationId: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: { 
        id: notificationId,
        userId 
      },
    });
  }

  // Contar notificaciones no leídas
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { 
        userId,
        read: false 
      },
    });
  }

  // Crear notificación de invitación a proyecto
  async createProjectInvitationNotification(
    userId: string, 
    projectName: string, 
    inviterName: string, 
    invitationId: string
  ) {
    return this.createNotification({
      userId,
      type: 'PROJECT_INVITATION',
      title: 'Nueva invitación a proyecto',
      message: `${inviterName} te ha invitado al proyecto "${projectName}"`,
      data: { 
        invitationId,
        projectName,
        inviterName 
      },
    });
  }

  // Crear notificación de invitación aceptada
  async createInvitationAcceptedNotification(
    userId: string, 
    projectName: string, 
    memberName: string
  ) {
    return this.createNotification({
      userId,
      type: 'INVITATION_ACCEPTED',
      title: 'Invitación aceptada',
      message: `${memberName} ha aceptado la invitación al proyecto "${projectName}"`,
      data: { 
        projectName,
        memberName 
      },
    });
  }

  // Crear notificación de invitación rechazada
  async createInvitationRejectedNotification(
    userId: string, 
    projectName: string, 
    memberName: string
  ) {
    return this.createNotification({
      userId,
      type: 'INVITATION_REJECTED',
      title: 'Invitación rechazada',
      message: `${memberName} ha rechazado la invitación al proyecto "${projectName}"`,
      data: { 
        projectName,
        memberName 
      },
    });
  }
}
