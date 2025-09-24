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
exports.MembershipService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../com\u00FAn/prisma.service");
const logger_service_1 = require("../../com\u00FAn/logger.service");
const notification_service_1 = require("../notifications/notification.service");
const uuid_1 = require("uuid");
const { MemberRole, InvitationStatus } = require('@prisma/client');
let MembershipService = class MembershipService {
    constructor(prisma, logger, notificationService) {
        this.prisma = prisma;
        this.logger = logger;
        this.notificationService = notificationService;
    }
    async inviteToProject(inviterUserId, dto) {
        try {
            this.logger.log(`🔄 Invitando usuarios al proyecto ${dto.projectId}`, 'MembershipService');
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
            const invited = [];
            const alreadyMembers = [];
            for (const email of dto.emails) {
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
                    const project = await this.prisma.project.findUnique({
                        where: { id: dto.projectId },
                        select: { name: true }
                    });
                    const inviter = await this.prisma.user.findUnique({
                        where: { id: inviterUserId },
                        select: { name: true }
                    });
                    const token = (0, uuid_1.v4)();
                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + 7);
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
                    await this.notificationService.createProjectInvitationNotification(user.id, project?.name || 'Proyecto', inviter?.name || 'Usuario', invitation.id);
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
                }
                else {
                    const token = (0, uuid_1.v4)();
                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + 7);
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
            if (invited.length > 0) {
                await this.prisma.project.update({
                    where: { id: dto.projectId },
                    data: { isShared: true },
                });
            }
            this.logger.log(`✅ Invitaciones enviadas: ${invited.length}, Ya miembros: ${alreadyMembers.length}`, 'MembershipService');
            return { invited, alreadyMembers };
        }
        catch (error) {
            this.logger.error(`Error invitando usuarios: ${error.message}`, error.stack, 'MembershipService');
            throw error;
        }
    }
    async getProjectMembers(projectId, userId) {
        try {
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
                    { role: 'asc' },
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
        }
        catch (error) {
            this.logger.error(`Error obteniendo miembros del proyecto: ${error.message}`, error.stack, 'MembershipService');
            throw error;
        }
    }
    async removeMember(projectId, memberUserId, ownerUserId) {
        try {
            this.logger.log(`🔄 Removiendo miembro ${memberUserId} del proyecto ${projectId}`, 'MembershipService');
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
            await this.prisma.projectMember.delete({
                where: {
                    id: memberToRemove.id,
                },
            });
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
        }
        catch (error) {
            this.logger.error(`Error removiendo miembro: ${error.message}`, error.stack, 'MembershipService');
            throw error;
        }
    }
    async acceptInvitation(token, userId) {
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
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user || user.email !== invitation.email) {
                throw new Error('Email no coincide con la invitación');
            }
            await this.prisma.projectMember.create({
                data: {
                    projectId: invitation.projectId,
                    userId,
                    role: MemberRole.MEMBER,
                },
            });
            await this.prisma.invitation.update({
                where: { id: invitation.id },
                data: { status: InvitationStatus.ACCEPTED },
            });
            const inviter = await this.prisma.user.findUnique({
                where: { id: invitation.invitedBy },
                select: { id: true }
            });
            if (inviter) {
                await this.notificationService.createInvitationAcceptedNotification(inviter.id, invitation.project.name, user.name);
            }
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
        }
        catch (error) {
            this.logger.error(`Error aceptando invitación: ${error.message}`, error.stack, 'MembershipService');
            throw error;
        }
    }
    async getUserProjects(userId) {
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
        }
        catch (error) {
            this.logger.error(`Error obteniendo proyectos del usuario: ${error.message}`, error.stack, 'MembershipService');
            throw error;
        }
    }
    async isMember(projectId, userId) {
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
        }
        catch (error) {
            this.logger.error(`Error verificando membresía: ${error.message}`, error.stack, 'MembershipService');
            return { isMember: false };
        }
    }
    async getPendingInvitations(email) {
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
        }
        catch (error) {
            this.logger.error(`Error obteniendo invitaciones pendientes: ${error.message}`, error.stack, 'MembershipService');
            throw error;
        }
    }
    async cleanupExpiredInvitations() {
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
        }
        catch (error) {
            this.logger.error(`Error limpiando invitaciones expiradas: ${error.message}`, error.stack, 'MembershipService');
            return 0;
        }
    }
    async rejectInvitation(invitationId, userId) {
        try {
            this.logger.log(`🔄 Rechazando invitación ${invitationId} para usuario ${userId}`, 'MembershipService');
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
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, name: true }
            });
            if (!user || user.email !== invitation.email) {
                throw new Error('No tienes permisos para rechazar esta invitación');
            }
            await this.prisma.invitation.update({
                where: { id: invitationId },
                data: { status: InvitationStatus.REVOKED },
            });
            await this.notificationService.createInvitationRejectedNotification(invitation.inviter.id, invitation.project.name, user.name);
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
        }
        catch (error) {
            this.logger.error(`Error rechazando invitación: ${error.message}`, error.stack, 'MembershipService');
            throw error;
        }
    }
    async getUserPendingInvitations(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { email: true }
            });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return this.getPendingInvitations(user.email);
        }
        catch (error) {
            this.logger.error(`Error obteniendo invitaciones del usuario: ${error.message}`, error.stack, 'MembershipService');
            throw error;
        }
    }
};
exports.MembershipService = MembershipService;
exports.MembershipService = MembershipService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        logger_service_1.LoggerService,
        notification_service_1.NotificationService])
], MembershipService);
//# sourceMappingURL=membership.service.js.map