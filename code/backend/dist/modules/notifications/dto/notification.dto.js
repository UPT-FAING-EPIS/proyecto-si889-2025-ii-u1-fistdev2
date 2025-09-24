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
exports.UnreadCountResponseDto = exports.NotificationResponseDto = exports.CreateNotificationDto = exports.NotificationType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var NotificationType;
(function (NotificationType) {
    NotificationType["PROJECT_INVITATION"] = "PROJECT_INVITATION";
    NotificationType["INVITATION_ACCEPTED"] = "INVITATION_ACCEPTED";
    NotificationType["INVITATION_REJECTED"] = "INVITATION_REJECTED";
    NotificationType["MEMBER_ADDED"] = "MEMBER_ADDED";
    NotificationType["MEMBER_REMOVED"] = "MEMBER_REMOVED";
    NotificationType["PROJECT_SHARED"] = "PROJECT_SHARED";
    NotificationType["TASK_ASSIGNED"] = "TASK_ASSIGNED";
    NotificationType["TASK_COMPLETED"] = "TASK_COMPLETED";
    NotificationType["COMMENT_ADDED"] = "COMMENT_ADDED";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
class CreateNotificationDto {
}
exports.CreateNotificationDto = CreateNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo de notificación',
        enum: NotificationType,
        example: NotificationType.PROJECT_INVITATION
    }),
    (0, class_validator_1.IsEnum)(NotificationType),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Título de la notificación',
        example: 'Nueva tarea asignada'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Mensaje de la notificación',
        example: 'Se te ha asignado una nueva tarea en el proyecto DevFlow'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Datos adicionales de la notificación (JSON)',
        required: false,
        example: { projectId: '123', taskId: '456' }
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateNotificationDto.prototype, "data", void 0);
class NotificationResponseDto {
}
exports.NotificationResponseDto = NotificationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID único de la notificación',
        example: 'clm123abc456'
    }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID del usuario destinatario',
        example: 'clm123user456'
    }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo de notificación',
        enum: NotificationType,
        example: NotificationType.TASK_ASSIGNED
    }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Título de la notificación',
        example: 'Nueva tarea asignada'
    }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Mensaje de la notificación',
        example: 'Se te ha asignado una nueva tarea en el proyecto DevFlow'
    }),
    __metadata("design:type", String)
], NotificationResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Datos adicionales de la notificación',
        required: false,
        example: { projectId: '123', taskId: '456' }
    }),
    __metadata("design:type", Object)
], NotificationResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Indica si la notificación ha sido leída',
        example: false
    }),
    __metadata("design:type", Boolean)
], NotificationResponseDto.prototype, "isRead", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Fecha de creación de la notificación',
        example: '2024-01-15T10:30:00.000Z'
    }),
    __metadata("design:type", Date)
], NotificationResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Fecha de última actualización',
        example: '2024-01-15T10:30:00.000Z'
    }),
    __metadata("design:type", Date)
], NotificationResponseDto.prototype, "updatedAt", void 0);
class UnreadCountResponseDto {
}
exports.UnreadCountResponseDto = UnreadCountResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Número de notificaciones no leídas',
        example: 5
    }),
    __metadata("design:type", Number)
], UnreadCountResponseDto.prototype, "count", void 0);
//# sourceMappingURL=notification.dto.js.map