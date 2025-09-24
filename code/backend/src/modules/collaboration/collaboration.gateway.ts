import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from '../../común/logger.service';
import { MembershipService } from '../membership/membership.service';
import { PrismaService } from '../../común/prisma.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  userName?: string;
}

export interface BoardEvent {
  type: string;
  projectId: string;
  actor: {
    id: string;
    email: string;
    name: string;
  };
  timestamp: Date;
  payload: any;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/collaboration',
})
export class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, AuthenticatedSocket[]>();
  private projectConnections = new Map<string, Set<string>>(); // projectId -> Set<userId>

  constructor(
    private jwtService: JwtService,
    private logger: LoggerService,
    private membershipService: MembershipService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      this.logger.log('🔄 Nueva conexión WebSocket', 'CollaborationGateway');

      // Extraer token del handshake
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn('❌ Conexión rechazada: sin token', 'CollaborationGateway');
        client.disconnect();
        return;
      }

      // Verificar JWT
      try {
        const payload = this.jwtService.verify(token);
        client.userId = payload.sub;
        client.userEmail = payload.email;
        client.userName = payload.name;

        // Almacenar socket del usuario
        if (!this.userSockets.has(client.userId)) {
          this.userSockets.set(client.userId, []);
        }
        this.userSockets.get(client.userId)!.push(client);

        // Actualizar última actividad
        await this.prisma.user.update({
          where: { id: client.userId },
          data: { lastSeen: new Date() },
        });

        this.logger.log(`✅ Usuario conectado: ${client.userEmail}`, 'CollaborationGateway');
      } catch (error) {
        this.logger.warn(`❌ Token inválido: ${error.message}`, 'CollaborationGateway');
        client.disconnect();
        return;
      }
    } catch (error) {
      this.logger.error(`Error en conexión: ${error.message}`, error.stack, 'CollaborationGateway');
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    try {
      if (client.userId) {
        // Remover socket del usuario
        const userSockets = this.userSockets.get(client.userId);
        if (userSockets) {
          const index = userSockets.indexOf(client);
          if (index > -1) {
            userSockets.splice(index, 1);
          }
          if (userSockets.length === 0) {
            this.userSockets.delete(client.userId);
          }
        }

        // Remover de conexiones de proyectos
        for (const [projectId, userIds] of this.projectConnections.entries()) {
          if (userIds.has(client.userId)) {
            userIds.delete(client.userId);
            // Notificar cambio de presencia
            this.server.to(`project:${projectId}`).emit('presence_update', {
              projectId,
              onlineCount: userIds.size,
              action: 'user_left',
              userId: client.userId,
            });
          }
        }

        this.logger.log(`✅ Usuario desconectado: ${client.userEmail}`, 'CollaborationGateway');
      }
    } catch (error) {
      this.logger.error(`Error en desconexión: ${error.message}`, error.stack, 'CollaborationGateway');
    }
  }

  @SubscribeMessage('join_project')
  async handleJoinProject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { projectId: string },
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'No autenticado' });
        return;
      }

      // Verificar que el usuario es miembro del proyecto
      const membership = await this.membershipService.isMember(data.projectId, client.userId);
      if (!membership.isMember) {
        client.emit('error', { message: 'No eres miembro de este proyecto' });
        return;
      }

      // Unirse al room del proyecto
      await client.join(`project:${data.projectId}`);

      // Actualizar conexiones del proyecto
      if (!this.projectConnections.has(data.projectId)) {
        this.projectConnections.set(data.projectId, new Set());
      }
      this.projectConnections.get(data.projectId)!.add(client.userId);

      // Notificar cambio de presencia
      const onlineCount = this.projectConnections.get(data.projectId)!.size;
      this.server.to(`project:${data.projectId}`).emit('presence_update', {
        projectId: data.projectId,
        onlineCount,
        action: 'user_joined',
        userId: client.userId,
        userName: client.userName,
      });

      client.emit('joined_project', {
        projectId: data.projectId,
        onlineCount,
        role: membership.role,
      });

      this.logger.log(`✅ Usuario ${client.userEmail} se unió al proyecto ${data.projectId}`, 'CollaborationGateway');
    } catch (error) {
      this.logger.error(`Error uniéndose al proyecto: ${error.message}`, error.stack, 'CollaborationGateway');
      client.emit('error', { message: 'Error uniéndose al proyecto' });
    }
  }

  @SubscribeMessage('leave_project')
  async handleLeaveProject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { projectId: string },
  ) {
    try {
      if (!client.userId) return;

      // Salir del room del proyecto
      await client.leave(`project:${data.projectId}`);

      // Actualizar conexiones del proyecto
      const projectUsers = this.projectConnections.get(data.projectId);
      if (projectUsers) {
        projectUsers.delete(client.userId);
        
        // Notificar cambio de presencia
        this.server.to(`project:${data.projectId}`).emit('presence_update', {
          projectId: data.projectId,
          onlineCount: projectUsers.size,
          action: 'user_left',
          userId: client.userId,
        });
      }

      this.logger.log(`✅ Usuario ${client.userEmail} salió del proyecto ${data.projectId}`, 'CollaborationGateway');
    } catch (error) {
      this.logger.error(`Error saliendo del proyecto: ${error.message}`, error.stack, 'CollaborationGateway');
    }
  }

  /**
   * Emitir evento de tablero a todos los miembros conectados
   */
  async emitBoardEvent(projectId: string, event: BoardEvent): Promise<void> {
    try {
      // Guardar evento en actividades
      await this.prisma.activity.create({
        data: {
          projectId,
          userId: event.actor.id,
          action: event.type,
          payload: event.payload,
        },
      });

      // Emitir a todos los conectados al proyecto
      this.server.to(`project:${projectId}`).emit('board_event', event);

      this.logger.debug(`📡 Evento emitido: ${event.type} en proyecto ${projectId}`, 'CollaborationGateway');
    } catch (error) {
      this.logger.error(`Error emitiendo evento: ${error.message}`, error.stack, 'CollaborationGateay');
    }
  }

  /**
   * Emitir evento de miembro añadido
   */
  async emitMemberAdded(projectId: string, memberInfo: any, actorInfo: any): Promise<void> {
    try {
      const event = {
        type: 'member_added',
        projectId,
        actor: actorInfo,
        timestamp: new Date(),
        payload: memberInfo,
      };

      this.server.to(`project:${projectId}`).emit('member_event', event);
      this.logger.log(`📡 Miembro añadido notificado en proyecto ${projectId}`, 'CollaborationGateway');
    } catch (error) {
      this.logger.error(`Error notificando miembro añadido: ${error.message}`, error.stack, 'CollaborationGateway');
    }
  }

  /**
   * Emitir evento de miembro removido
   */
  async emitMemberRemoved(projectId: string, removedMemberInfo: any, actorInfo: any): Promise<void> {
    try {
      const event = {
        type: 'member_removed',
        projectId,
        actor: actorInfo,
        timestamp: new Date(),
        payload: removedMemberInfo,
      };

      this.server.to(`project:${projectId}`).emit('member_event', event);
      
      // Desconectar al usuario removido del proyecto
      const userSockets = this.userSockets.get(removedMemberInfo.userId);
      if (userSockets) {
        userSockets.forEach(socket => {
          socket.leave(`project:${projectId}`);
          socket.emit('removed_from_project', { projectId });
        });
      }

      this.logger.log(`📡 Miembro removido notificado en proyecto ${projectId}`, 'CollaborationGateway');
    } catch (error) {
      this.logger.error(`Error notificando miembro removido: ${error.message}`, error.stack, 'CollaborationGateway');
    }
  }

  /**
   * Obtener usuarios conectados en un proyecto
   */
  getProjectOnlineUsers(projectId: string): string[] {
    const connections = this.projectConnections.get(projectId);
    return connections ? Array.from(connections) : [];
  }

  /**
   * Obtener estadísticas de presencia
   */
  getPresenceStats(): { totalConnected: number; projectConnections: number } {
    return {
      totalConnected: this.userSockets.size,
      projectConnections: this.projectConnections.size,
    };
  }
}
