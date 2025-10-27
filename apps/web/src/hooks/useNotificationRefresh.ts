import { useCallback } from 'react'

/**
 * Hook para forçar atualização das notificações
 * Emite um evento customizado que o NotificationMenu escuta
 */
export function useNotificationRefresh() {
  const refreshNotifications = useCallback(() => {
    window.dispatchEvent(new CustomEvent('refresh-notifications'))
  }, [])

  return { refreshNotifications }
}
