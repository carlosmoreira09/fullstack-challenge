import {NotificationStatus, NotificationType} from "../notifications.enums.js";

export interface NotificationDTO {
    id: string
    userId: string
    type: NotificationType
    title: string
    payload: string
    status: NotificationStatus
    read_at: string;
    createdAt: string
    updatedAt: string
}
