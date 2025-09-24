export declare enum NotificationType {
    PROJECT_INVITATION = "PROJECT_INVITATION",
    INVITATION_ACCEPTED = "INVITATION_ACCEPTED",
    INVITATION_REJECTED = "INVITATION_REJECTED",
    MEMBER_ADDED = "MEMBER_ADDED",
    MEMBER_REMOVED = "MEMBER_REMOVED",
    PROJECT_SHARED = "PROJECT_SHARED",
    TASK_ASSIGNED = "TASK_ASSIGNED",
    TASK_COMPLETED = "TASK_COMPLETED",
    COMMENT_ADDED = "COMMENT_ADDED"
}
export declare class CreateNotificationDto {
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
}
export declare class NotificationResponseDto {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class UnreadCountResponseDto {
    count: number;
}
