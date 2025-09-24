import { PrismaService } from '../../común/prisma.service';
export interface CreateNotificationDto {
    userId: string;
    type: 'PROJECT_INVITATION' | 'INVITATION_ACCEPTED' | 'INVITATION_REJECTED' | 'MEMBER_ADDED' | 'MEMBER_REMOVED' | 'PROJECT_SHARED' | 'TASK_ASSIGNED' | 'TASK_COMPLETED' | 'COMMENT_ADDED';
    title: string;
    message: string;
    data?: any;
}
export declare class NotificationService {
    private prisma;
    constructor(prisma: PrismaService);
    createNotification(createDto: CreateNotificationDto): Promise<{
        id: string;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        title: string;
        read: boolean;
    }>;
    getUserNotifications(userId: string): Promise<{
        id: string;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        title: string;
        read: boolean;
    }[]>;
    getUnreadNotifications(userId: string): Promise<{
        id: string;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        title: string;
        read: boolean;
    }[]>;
    markAsRead(notificationId: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    deleteNotification(notificationId: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getUnreadCount(userId: string): Promise<number>;
    createProjectInvitationNotification(userId: string, projectName: string, inviterName: string, invitationId: string): Promise<{
        id: string;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        title: string;
        read: boolean;
    }>;
    createInvitationAcceptedNotification(userId: string, projectName: string, memberName: string): Promise<{
        id: string;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        title: string;
        read: boolean;
    }>;
    createInvitationRejectedNotification(userId: string, projectName: string, memberName: string): Promise<{
        id: string;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        title: string;
        read: boolean;
    }>;
}
