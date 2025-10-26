export enum NotificationType {
    TASK_ASSIGNED = 'task_assigned',
    TASK_UPDATED = 'task_updated',
    COMMENT_CREATED = 'comment_created',
}

export enum NotificationStatus {
    UNREAD = 'unread',
    READ = 'read',
}

export interface Notification {
    id: string
    userId: string
    type: NotificationType
    title: string
    payload: string
    metadata: any
    status: NotificationStatus
    read_at?: string
    createdAt: string
    updatedAt: string
}