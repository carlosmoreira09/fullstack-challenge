/**
 * Notification Enums
 */
export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_UPDATED = 'task_updated',
  COMMENT_CREATED = 'comment_created',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
}

/**
 * Notification Interfaces
 */
export interface NotificationDTO {
  id: string
  userId: string
  type: NotificationType
  title: string
  metadata?: any
  payload: string
  status: NotificationStatus
  read_at: string
  createdAt: string
  updatedAt: string
}

export interface CreateNotificationDto {
  userId: string
  type: NotificationType
  title: string
  payload?: string
  status?: NotificationStatus
}

export interface UpdateNotificationDto {
  id: string
  status?: NotificationStatus
  read_at?: string
}
