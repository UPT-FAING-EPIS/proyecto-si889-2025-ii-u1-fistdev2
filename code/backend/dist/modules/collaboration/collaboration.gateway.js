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
exports.CollaborationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const logger_service_1 = require("../../com\u00FAn/logger.service");
const membership_service_1 = require("../membership/membership.service");
const prisma_service_1 = require("../../com\u00FAn/prisma.service");
let CollaborationGateway = class CollaborationGateway {
    constructor(jwtService, logger, membershipService, prisma) {
        this.jwtService = jwtService;
        this.logger = logger;
        this.membershipService = membershipService;
        this.prisma = prisma;
        this.userSockets = new Map();
        this.projectConnections = new Map();
    }
    async handleConnection(client) {
        try {
            this.logger.log('🔄 Nueva conexión WebSocket', 'CollaborationGateway');
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                this.logger.warn('❌ Conexión rechazada: sin token', 'CollaborationGateway');
                client.disconnect();
                return;
            }
            try {
                const payload = this.jwtService.verify(token);
                client.userId = payload.sub;
                client.userEmail = payload.email;
                client.userName = payload.name;
                if (!this.userSockets.has(client.userId)) {
                    this.userSockets.set(client.userId, []);
                }
                this.userSockets.get(client.userId).push(client);
                await this.prisma.user.update({
                    where: { id: client.userId },
                    data: { lastSeen: new Date() },
                });
                this.logger.log(`✅ Usuario conectado: ${client.userEmail}`, 'CollaborationGateway');
            }
            catch (error) {
                this.logger.warn(`❌ Token inválido: ${error.message}`, 'CollaborationGateway');
                client.disconnect();
                return;
            }
        }
        catch (error) {
            this.logger.error(`Error en conexión: ${error.message}`, error.stack, 'CollaborationGateway');
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        try {
            if (client.userId) {
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
                for (const [projectId, userIds] of this.projectConnections.entries()) {
                    if (userIds.has(client.userId)) {
                        userIds.delete(client.userId);
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
        }
        catch (error) {
            this.logger.error(`Error en desconexión: ${error.message}`, error.stack, 'CollaborationGateway');
        }
    }
    async handleJoinProject(client, data) {
        try {
            if (!client.userId) {
                client.emit('error', { message: 'No autenticado' });
                return;
            }
            const membership = await this.membershipService.isMember(data.projectId, client.userId);
            if (!membership.isMember) {
                client.emit('error', { message: 'No eres miembro de este proyecto' });
                return;
            }
            await client.join(`project:${data.projectId}`);
            if (!this.projectConnections.has(data.projectId)) {
                this.projectConnections.set(data.projectId, new Set());
            }
            this.projectConnections.get(data.projectId).add(client.userId);
            const onlineCount = this.projectConnections.get(data.projectId).size;
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
        }
        catch (error) {
            this.logger.error(`Error uniéndose al proyecto: ${error.message}`, error.stack, 'CollaborationGateway');
            client.emit('error', { message: 'Error uniéndose al proyecto' });
        }
    }
    async handleLeaveProject(client, data) {
        try {
            if (!client.userId)
                return;
            await client.leave(`project:${data.projectId}`);
            const projectUsers = this.projectConnections.get(data.projectId);
            if (projectUsers) {
                projectUsers.delete(client.userId);
                this.server.to(`project:${data.projectId}`).emit('presence_update', {
                    projectId: data.projectId,
                    onlineCount: projectUsers.size,
                    action: 'user_left',
                    userId: client.userId,
                });
            }
            this.logger.log(`✅ Usuario ${client.userEmail} salió del proyecto ${data.projectId}`, 'CollaborationGateway');
        }
        catch (error) {
            this.logger.error(`Error saliendo del proyecto: ${error.message}`, error.stack, 'CollaborationGateway');
        }
    }
    async emitBoardEvent(projectId, event) {
        try {
            await this.prisma.activity.create({
                data: {
                    projectId,
                    userId: event.actor.id,
                    action: event.type,
                    payload: event.payload,
                },
            });
            this.server.to(`project:${projectId}`).emit('board_event', event);
            this.logger.debug(`📡 Evento emitido: ${event.type} en proyecto ${projectId}`, 'CollaborationGateway');
        }
        catch (error) {
            this.logger.error(`Error emitiendo evento: ${error.message}`, error.stack, 'CollaborationGateay');
        }
    }
    async emitMemberAdded(projectId, memberInfo, actorInfo) {
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
        }
        catch (error) {
            this.logger.error(`Error notificando miembro añadido: ${error.message}`, error.stack, 'CollaborationGateway');
        }
    }
    async emitMemberRemoved(projectId, removedMemberInfo, actorInfo) {
        try {
            const event = {
                type: 'member_removed',
                projectId,
                actor: actorInfo,
                timestamp: new Date(),
                payload: removedMemberInfo,
            };
            this.server.to(`project:${projectId}`).emit('member_event', event);
            const userSockets = this.userSockets.get(removedMemberInfo.userId);
            if (userSockets) {
                userSockets.forEach(socket => {
                    socket.leave(`project:${projectId}`);
                    socket.emit('removed_from_project', { projectId });
                });
            }
            this.logger.log(`📡 Miembro removido notificado en proyecto ${projectId}`, 'CollaborationGateway');
        }
        catch (error) {
            this.logger.error(`Error notificando miembro removido: ${error.message}`, error.stack, 'CollaborationGateway');
        }
    }
    getProjectOnlineUsers(projectId) {
        const connections = this.projectConnections.get(projectId);
        return connections ? Array.from(connections) : [];
    }
    getPresenceStats() {
        return {
            totalConnected: this.userSockets.size,
            projectConnections: this.projectConnections.size,
        };
    }
};
exports.CollaborationGateway = CollaborationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], CollaborationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_project'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CollaborationGateway.prototype, "handleJoinProject", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_project'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CollaborationGateway.prototype, "handleLeaveProject", null);
exports.CollaborationGateway = CollaborationGateway = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
        namespace: '/collaboration',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        logger_service_1.LoggerService,
        membership_service_1.MembershipService,
        prisma_service_1.PrismaService])
], CollaborationGateway);
//# sourceMappingURL=collaboration.gateway.js.map