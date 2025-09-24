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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../com\u00FAn/prisma.service");
let NotificationService = class NotificationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createNotification(createDto) {
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
    async getUserNotifications(userId) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getUnreadNotifications(userId) {
        return this.prisma.notification.findMany({
            where: {
                userId,
                read: false
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async markAsRead(notificationId, userId) {
        return this.prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId
            },
            data: { read: true },
        });
    }
    async markAllAsRead(userId) {
        return this.prisma.notification.updateMany({
            where: {
                userId,
                read: false
            },
            data: { read: true },
        });
    }
    async deleteNotification(notificationId, userId) {
        return this.prisma.notification.deleteMany({
            where: {
                id: notificationId,
                userId
            },
        });
    }
    async getUnreadCount(userId) {
        return this.prisma.notification.count({
            where: {
                userId,
                read: false
            },
        });
    }
    async createProjectInvitationNotification(userId, projectName, inviterName, invitationId) {
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
    async createInvitationAcceptedNotification(userId, projectName, memberName) {
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
    async createInvitationRejectedNotification(userId, projectName, memberName) {
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
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map