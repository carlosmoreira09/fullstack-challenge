import apiClient from '@/lib/interceptor.ts'

export const notificationService = () => {
  const listNotifications = async () => {
    const response = await apiClient.get('/notifications')
    return response.data
  }

  const markAsRead = async (notificationId: string) => {
    const response = await apiClient.patch(
      `/notifications/${notificationId}/read`,
    )
    return response.data
  }

  const markAllAsRead = async () => {
    const response = await apiClient.patch('/notifications/read-all')
    return response.data
  }

  return {
    listNotifications,
    markAsRead,
    markAllAsRead,
  }
}
