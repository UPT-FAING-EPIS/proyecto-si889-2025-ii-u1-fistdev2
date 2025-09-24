import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum NotificationType {
  PROJECT_INVITATION = 'PROJECT_INVITATION',
  INVITATION_ACCEPTED = 'INVITATION_ACCEPTED',
  INVITATION_REJECTED = 'INVITATION_REJECTED',
  MEMBER_ADDED = 'MEMBER_ADDED',
  MEMBER_REMOVED = 'MEMBER_REMOVED',
  PROJECT_SHARED = 'PROJECT_SHARED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  COMMENT_ADDED = 'COMMENT_ADDED'
}

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Tipo de notificación',
    enum: NotificationType,
    example: NotificationType.PROJECT_INVITATION
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Título de la notificación',
    example: 'Nueva tarea asignada'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Mensaje de la notificación',
    example: 'Se te ha asignado una nueva tarea en el proyecto DevFlow'
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Datos adicionales de la notificación (JSON)',
    required: false,
    example: { projectId: '123', taskId: '456' }
  })
  @IsOptional()
  data?: any;
}

export class NotificationResponseDto {
  @ApiProperty({
    description: 'ID único de la notificación',
    example: 'clm123abc456'
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario destinatario',
    example: 'clm123user456'
  })
  userId: string;

  @ApiProperty({
    description: 'Tipo de notificación',
    enum: NotificationType,
    example: NotificationType.TASK_ASSIGNED
  })
  type: NotificationType;

  @ApiProperty({
    description: 'Título de la notificación',
    example: 'Nueva tarea asignada'
  })
  title: string;

  @ApiProperty({
    description: 'Mensaje de la notificación',
    example: 'Se te ha asignado una nueva tarea en el proyecto DevFlow'
  })
  message: string;

  @ApiProperty({
    description: 'Datos adicionales de la notificación',
    required: false,
    example: { projectId: '123', taskId: '456' }
  })
  data?: any;

  @ApiProperty({
    description: 'Indica si la notificación ha sido leída',
    example: false
  })
  isRead: boolean;

  @ApiProperty({
    description: 'Fecha de creación de la notificación',
    example: '2024-01-15T10:30:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00.000Z'
  })
  updatedAt: Date;
}

export class UnreadCountResponseDto {
  @ApiProperty({
    description: 'Número de notificaciones no leídas',
    example: 5
  })
  count: number;
}