import {NotificationStatus, NotificationType} from "../notifications.enums";

export interface NotificationDTO {
    id: string
    userId: string
    type: NotificationType
    title: string
    payload: string
    status: NotificationStatus
    readAt: string;
    createdAt: string
    updatedAt: string
}
