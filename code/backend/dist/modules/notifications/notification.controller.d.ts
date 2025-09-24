import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/notification.dto';
export declare class NotificationController {
    private notificationService;
    constructor(notificationService: NotificationService);
    createNotification(createDto: CreateNotificationDto, req: any): Promise<{
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
    getUserNotifications(req: any): Promise<{
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
    getUnreadNotifications(req: any): Promise<{
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
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
    markAsRead(id: string, req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsRead(req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    deleteNotification(id: string, req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
