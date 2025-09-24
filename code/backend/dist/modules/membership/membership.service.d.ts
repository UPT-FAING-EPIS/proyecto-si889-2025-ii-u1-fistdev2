import { PrismaService } from '../../común/prisma.service';
import { LoggerService } from '../../común/logger.service';
import { NotificationService } from '../notifications/notification.service';
declare const MemberRole: any;
type MemberRole = 'OWNER' | 'MEMBER' | 'VIEWER';
export interface InviteToProjectDto {
    emails: string[];
    projectId: string;
    role?: MemberRole;
}
export interface ProjectMemberDto {
    id: string;
    userId: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
    role: MemberRole;
    joinedAt: Date;
}
export interface UserProjectDto {
    id: string;
    name: string;
    description?: string;
    role: MemberRole;
    isOwner: boolean;
    memberCount: number;
    lastActivity?: Date;
}
export declare class MembershipService {
    private prisma;
    private logger;
    private notificationService;
    constructor(prisma: PrismaService, logger: LoggerService, notificationService: NotificationService);
    inviteToProject(inviterUserId: string, dto: InviteToProjectDto): Promise<{
        invited: string[];
        alreadyMembers: string[];
    }>;
    getProjectMembers(projectId: string, userId: string): Promise<ProjectMemberDto[]>;
    removeMember(projectId: string, memberUserId: string, ownerUserId: string): Promise<void>;
    acceptInvitation(token: string, userId: string): Promise<{
        projectId: string;
        projectName: string;
    }>;
    getUserProjects(userId: string): Promise<UserProjectDto[]>;
    isMember(projectId: string, userId: string): Promise<{
        isMember: boolean;
        role?: MemberRole;
    }>;
    getPendingInvitations(email: string): Promise<any[]>;
    cleanupExpiredInvitations(): Promise<number>;
    rejectInvitation(invitationId: string, userId: string): Promise<any>;
    getUserPendingInvitations(userId: string): Promise<any[]>;
}
export {};
