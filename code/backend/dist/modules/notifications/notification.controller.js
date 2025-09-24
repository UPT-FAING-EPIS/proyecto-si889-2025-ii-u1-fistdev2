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
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../com\u00FAn/guards/jwt-auth.guard");
const notification_service_1 = require("./notification.service");
const notification_dto_1 = require("./dto/notification.dto");
let NotificationController = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async createNotification(createDto, req) {
        return this.notificationService.createNotification({
            userId: req.user.userId,
            type: createDto.type,
            title: createDto.title,
            message: createDto.message,
            data: createDto.data
        });
    }
    async getUserNotifications(req) {
        return this.notificationService.getUserNotifications(req.user.userId);
    }
    async getUnreadNotifications(req) {
        return this.notificationService.getUnreadNotifications(req.user.userId);
    }
    async getUnreadCount(req) {
        const count = await this.notificationService.getUnreadCount(req.user.userId);
        return { count };
    }
    async markAsRead(id, req) {
        return this.notificationService.markAsRead(id, req.user.userId);
    }
    async markAllAsRead(req) {
        return this.notificationService.markAllAsRead(req.user.userId);
    }
    async deleteNotification(id, req) {
        return this.notificationService.deleteNotification(id, req.user.userId);
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear una nueva notificación' }),
    (0, swagger_1.ApiBody)({ type: notification_dto_1.CreateNotificationDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Notificación creada exitosamente',
        type: notification_dto_1.NotificationResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos de entrada inválidos' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_dto_1.CreateNotificationDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "createNotification", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todas las notificaciones del usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de notificaciones del usuario',
        type: [notification_dto_1.NotificationResponseDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUserNotifications", null);
__decorate([
    (0, common_1.Get)('unread'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener notificaciones no leídas del usuario' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de notificaciones no leídas',
        type: [notification_dto_1.NotificationResponseDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUnreadNotifications", null);
__decorate([
    (0, common_1.Get)('unread/count'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener el número de notificaciones no leídas' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Número de notificaciones no leídas',
        type: notification_dto_1.UnreadCountResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar una notificación como leída' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de la notificación' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Notificación marcada como leída',
        type: notification_dto_1.NotificationResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notificación no encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('read-all'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar todas las notificaciones como leídas' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Todas las notificaciones marcadas como leídas',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar una notificación' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de la notificación' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Notificación eliminada exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'No autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notificación no encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "deleteNotification", null);
exports.NotificationController = NotificationController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map