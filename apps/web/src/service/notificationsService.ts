import apiClient from "@/lib/interceptor.ts";


export const notificationService = () => {
    const listNotifications = async () => {
        const response = await apiClient.get('/notifications')
        return response.data;
    }
    return {
        listNotifications,
    }
}