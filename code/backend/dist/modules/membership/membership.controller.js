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
exports.MembershipController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../com\u00FAn/guards/jwt-auth.guard");
const membership_service_1 = require("./membership.service");
const logger_service_1 = require("../../com\u00FAn/logger.service");
let MembershipController = class MembershipController {
    constructor(membershipService, logger) {
        this.membershipService = membershipService;
        this.logger = logger;
    }
    async inviteToProject(projectId, body, req) {
        try {
            this.logger.log(`🔄 Invitando usuarios al proyecto: ${projectId}`, 'MembershipController');
            const dto = {
                projectId,
                emails: body.emails,
                role: body.role || 'MEMBER',
            };
            const result = await this.membershipService.inviteToProject(req.user.id, dto);
            return {
                success: true,
                data: result,
                message: `${result.invited.length} invitaciones enviadas`,
            };
        }
        catch (error) {
            this.logger.error(`Error en inviteToProject: ${error.message}`, error.stack, 'MembershipController');
            throw error;
        }
    }
    async getProjectMembers(projectId, req) {
        try {
            this.logger.log(`🔄 Obteniendo miembros del proyecto: ${projectId}`, 'MembershipController');
            const members = await this.membershipService.getProjectMembers(projectId, req.user.id);
            return {
                success: true,
                data: members,
                total: members.length,
            };
        }
        catch (error) {
            this.logger.error(`Error en getProjectMembers: ${error.message}`, error.stack, 'MembershipController');
            throw error;
        }
    }
    async removeMember(projectId, memberId, req) {
        try {
            this.logger.log(`🔄 Removiendo miembro ${memberId} del proyecto: ${projectId}`, 'MembershipController');
            await this.membershipService.removeMember(projectId, memberId, req.user.id);
            return {
                success: true,
                message: 'Miembro removido exitosamente',
            };
        }
        catch (error) {
            this.logger.error(`Error en removeMember: ${error.message}`, error.stack, 'MembershipController');
            throw error;
        }
    }
    async acceptInvitation(token, req) {
        try {
            this.logger.log(`🔄 Aceptando invitación con token: ${token}`, 'MembershipController');
            const result = await this.membershipService.acceptInvitation(token, req.user.id);
            return {
                success: true,
                data: result,
                message: `Te has unido al proyecto: ${result.projectName}`,
            };
        }
        catch (error) {
            this.logger.error(`Error en acceptInvitation: ${error.message}`, error.stack, 'MembershipController');
            throw error;
        }
    }
    async getUserProjects(req) {
        try {
            this.logger.log(`🔄 Obteniendo proyectos del usuario: ${req.user.id}`, 'MembershipController');
            const projects = await this.membershipService.getUserProjects(req.user.id);
            return {
                success: true,
                data: projects,
                total: projects.length,
            };
        }
        catch (error) {
            this.logger.error(`Error en getUserProjects: ${error.message}`, error.stack, 'MembershipController');
            throw error;
        }
    }
    async getPendingInvitations(req) {
        try {
            this.logger.log(`🔄 Obteniendo invitaciones pendientes para: ${req.user.email}`, 'MembershipController');
            const invitations = await this.membershipService.getPendingInvitations(req.user.email);
            return {
                success: true,
                data: invitations,
                total: invitations.length,
            };
        }
        catch (error) {
            this.logger.error(`Error en getPendingInvitations: ${error.message}`, error.stack, 'MembershipController');
            throw error;
        }
    }
    async checkMembership(projectId, req) {
        try {
            const result = await this.membershipService.isMember(projectId, req.user.id);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            this.logger.error(`Error en checkMembership: ${error.message}`, error.stack, 'MembershipController');
            throw error;
        }
    }
    async getMyInvitations(req) {
        try {
            const invitations = await this.membershipService.getUserPendingInvitations(req.user.id);
            return {
                success: true,
                data: invitations,
            };
        }
        catch (error) {
            this.logger.error(`Error obteniendo invitaciones: ${error.message}`, error.stack, 'MembershipController');
            throw error;
        }
    }
    async rejectInvitation(invitationId, req) {
        try {
            const result = await this.membershipService.rejectInvitation(invitationId, req.user.id);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            this.logger.error(`Error rechazando invitación: ${error.message}`, error.stack, 'MembershipController');
            throw error;
        }
    }
};
exports.MembershipController = MembershipController;
__decorate([
    (0, common_1.Post)(':projectId/invite'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Invitar usuarios a un proyecto',
        description: 'Invita usuarios por email a un proyecto. Solo el owner puede invitar.',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Solo el owner puede invitar' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], MembershipController.prototype, "inviteToProject", null);
__decorate([
    (0, common_1.Get)(':projectId/members'),
    (0, swagger_1.ApiOperation)({
        summary: 'Listar miembros del proyecto',
        description: 'Obtiene la lista de todos los miembros del proyecto con sus roles',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de miembros obtenida exitosamente',
    }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MembershipController.prototype, "getProjectMembers", null);
__decorate([
    (0, common_1.Delete)(':projectId/members/:memberId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Remover miembro del proyecto',
        description: 'Remueve un miembro del proyecto. Solo el owner puede remover miembros.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Miembro removido exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Solo el owner puede remover miembros' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('memberId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MembershipController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Post)('invitations/:token/accept'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Aceptar invitación a proyecto',
        description: 'Acepta una invitación usando el token recibido',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Invitación aceptada exitosamente',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Token inválido o expirado' }),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MembershipController.prototype, "acceptInvitation", null);
__decorate([
    (0, common_1.Get)('my-projects'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener proyectos del usuario',
        description: 'Obtiene todos los proyectos donde el usuario es miembro (propios y compartidos)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de proyectos obtenida exitosamente',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MembershipController.prototype, "getUserProjects", null);
__decorate([
    (0, common_1.Get)('invitations'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener invitaciones pendientes',
        description: 'Obtiene las invitaciones pendientes para el usuario actual',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de invitaciones pendientes',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MembershipController.prototype, "getPendingInvitations", null);
__decorate([
    (0, common_1.Get)(':projectId/check-membership'),
    (0, swagger_1.ApiOperation)({
        summary: 'Verificar membresía en proyecto',
        description: 'Verifica si el usuario actual es miembro del proyecto',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Estado de membresía verificado',
    }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MembershipController.prototype, "checkMembership", null);
__decorate([
    (0, common_1.Get)('invitations/me'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener invitaciones pendientes del usuario',
        description: 'Obtiene todas las invitaciones pendientes del usuario autenticado',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MembershipController.prototype, "getMyInvitations", null);
__decorate([
    (0, common_1.Post)('invitations/:invitationId/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Rechazar invitación a proyecto',
        description: 'Rechaza una invitación pendiente',
    }),
    __param(0, (0, common_1.Param)('invitationId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MembershipController.prototype, "rejectInvitation", null);
exports.MembershipController = MembershipController = __decorate([
    (0, swagger_1.ApiTags)('Project Membership'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [membership_service_1.MembershipService,
        logger_service_1.LoggerService])
], MembershipController);
//# sourceMappingURL=membership.controller.js.map