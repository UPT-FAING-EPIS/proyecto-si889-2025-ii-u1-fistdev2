import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../común/guards/jwt-auth.guard';
import { NotificationService } from './notification.service';
import {
  CreateNotificationDto,
  NotificationResponseDto,
  UnreadCountResponseDto,
  NotificationType,
} from './dto/notification.dto';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  // Crear una nueva notificación (para testing)
  @Post()
  @ApiOperation({ summary: 'Crear una nueva notificación' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({
    status: 201,
    description: 'Notificación creada exitosamente',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async createNotification(@Body() createDto: CreateNotificationDto, @Request() req: any) {
    return this.notificationService.createNotification({
      userId: req.user.userId,
      type: createDto.type,
      title: createDto.title,
      message: createDto.message,
      data: createDto.data
    });
  }

  // Obtener todas las notificaciones del usuario
  @Get()
  @ApiOperation({ summary: 'Obtener todas las notificaciones del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificaciones del usuario',
    type: [NotificationResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getUserNotifications(@Request() req: any) {
    return this.notificationService.getUserNotifications(req.user.userId);
  }

  // Obtener notificaciones no leídas
  @Get('unread')
  @ApiOperation({ summary: 'Obtener notificaciones no leídas del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificaciones no leídas',
    type: [NotificationResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getUnreadNotifications(@Request() req: any) {
    return this.notificationService.getUnreadNotifications(req.user.userId);
  }

  // Obtener contador de no leídas
  @Get('unread/count')
  @ApiOperation({ summary: 'Obtener el número de notificaciones no leídas' })
  @ApiResponse({
    status: 200,
    description: 'Número de notificaciones no leídas',
    type: UnreadCountResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationService.getUnreadCount(req.user.userId);
    return { count };
  }

  // Marcar notificación como leída
  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({
    status: 200,
    description: 'Notificación marcada como leída',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificationService.markAsRead(id, req.user.userId);
  }

  // Marcar todas como leídas
  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({
    status: 200,
    description: 'Todas las notificaciones marcadas como leídas',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async markAllAsRead(@Request() req: any) {
    return this.notificationService.markAllAsRead(req.user.userId);
  }

  // Eliminar notificación
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una notificación' })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({
    status: 200,
    description: 'Notificación eliminada exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  async deleteNotification(@Param('id') id: string, @Request() req: any) {
    return this.notificationService.deleteNotification(id, req.user.userId);
  }
}
