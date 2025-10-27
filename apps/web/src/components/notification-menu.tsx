
import {useCallback, useEffect, useMemo, useState} from 'react'
import { BellIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { notificationsSocket} from "@/service/notificationsWebSocket.ts";
import {notificationService} from "@/service/notificationsService.ts";
import {type NotificationDTO as Notification, NotificationStatus} from "@/types";

const formatNotificationDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
}

interface NotificationMenuProps {
    userId: string
}

function Dot({ className }: { className?: string }) {
    return (
        <svg
            width="6"
            height="6"
            fill="currentColor"
            viewBox="0 0 6 6"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <circle cx="3" cy="3" r="3" />
        </svg>
    )
}

export default function NotificationMenu({ userId }: NotificationMenuProps) {
    const [notifications, setNotifications] = useState<Array<Notification>>([])
    const [isLoading, setIsLoading] = useState(true)
    const notificationsApi = useMemo(() => notificationService(), [])

    const loadNotifications = useCallback(async () => {
        try {
            setIsLoading(true)
            const existingNotifications =  await notificationsApi.listNotifications()
            setNotifications(existingNotifications)
        } catch (error) {
            console.error('Failed to load notifications:', error)
        } finally {
            setIsLoading(false)
        }
    }, [notificationsApi])

    useEffect(() => {
        loadNotifications()
    }, [loadNotifications])

    useEffect(() => {
        const handleRefresh = () => {
            loadNotifications()
        }

        window.addEventListener('refresh-notifications', handleRefresh)
        return () => {
            window.removeEventListener('refresh-notifications', handleRefresh)
        }
    }, [loadNotifications])

    useEffect(() => {
        if (!userId) {
            console.warn('⚠️ NotificationMenu: userId is not provided')
            return
        }

        function onConnect() {
            console.log('✅ WebSocket connected, authenticating...')
            console.log('   Socket ID:', notificationsSocket.id)
            console.log('   User ID:', userId)
            if (userId) {
                notificationsSocket.emit('authenticate', { userId })
            }
        }

        function onDisconnect() {
            console.log('❌ WebSocket disconnected')
        }

        function onAuthenticate(data: { success: boolean; message?: string; userId?: string }) {
            if (data.success) {
                console.log('✅ WebSocket authenticated successfully')
                console.log('   User ID:', data.userId)
                console.log('   Socket ID:', notificationsSocket.id)
            } else {
                console.error('❌ WebSocket authentication failed:', data.message)
                toast.error('Failed to connect to notifications', {
                    description: data.message || 'Authentication failed'
                })
            }
        }

        function onNewNotification(notification: Notification) {
            console.log('🔔 NEW NOTIFICATION RECEIVED!')
            console.log('   Notification ID:', notification.id)
            console.log('   Title:', notification.title)
            console.log('   Payload:', notification.payload)
            console.log('   Full notification:', notification)
            
            setNotifications((prev) => {
                console.log('   Adding to list. Current count:', prev.length)
                return [notification, ...prev]
            })

            toast(notification.title || 'New Notification', {
                description: notification.payload,
                duration: 4000,
            })
        }

        function onError(error: any) {
            console.error('❌ WebSocket error:', error)
        }
        notificationsSocket.off('connect', onConnect)
        notificationsSocket.off('disconnect', onDisconnect)
        notificationsSocket.off('authenticated', onAuthenticate)
        notificationsSocket.off('notification', onNewNotification)
        notificationsSocket.off('error', onError)

        notificationsSocket.on('connect', onConnect)
        notificationsSocket.on('disconnect', onDisconnect)
        notificationsSocket.on('authenticated', onAuthenticate)
        notificationsSocket.on('notification', onNewNotification)
        notificationsSocket.on('error', onError)

        const debugListener = (eventName: string, ...args: any[]) => {
            console.log('📨 WebSocket event received:', eventName, args)
        }
        notificationsSocket.onAny(debugListener)
        if (notificationsSocket.connected) {
            console.log('🔄 Socket already connected, authenticating...')
            notificationsSocket.emit('authenticate', { userId })
        } else {
            console.log('⏳ Socket not connected yet, waiting for connection...')
        }

        return () => {
            console.log('🧹 Cleaning up WebSocket listeners for user:', userId)
            notificationsSocket.off('connect', onConnect)
            notificationsSocket.off('disconnect', onDisconnect)
            notificationsSocket.off('authenticated', onAuthenticate)
            notificationsSocket.off('notification', onNewNotification)
            notificationsSocket.off('error', onError)
            notificationsSocket.offAny(debugListener)
        }
    }, [userId])

    const unreadCount = Array.isArray(notifications)
        ? notifications.filter((n) => n.status === NotificationStatus.UNREAD).length
        : 0

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsApi.markAllAsRead()
            setNotifications(
                notifications.map((notification) => ({
                    ...notification,
                    status: NotificationStatus.READ,
                    read_at: new Date().toISOString(),
                })),
            )
            toast.success('All notifications marked as read')
        } catch (error) {
            console.error('Failed to mark all as read:', error)
            toast.error('Failed to mark notifications as read')
        }
    }

    const handleNotificationClick = async (id: string) => {
        try {
            await notificationsApi.markAsRead(id)
            setNotifications(
                notifications.map((notification) =>
                    notification.id === id
                        ? { ...notification, status: NotificationStatus.READ, read_at: new Date().toISOString() }
                        : notification,
                ),
            )
        } catch (error) {
            console.error('Failed to mark notification as read:', error)
            toast.error('Failed to mark notification as read')
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground relative size-8 rounded-full shadow-none"
                    aria-label="Open notifications"
                >
                    <BellIcon size={16} aria-hidden="true" />
                    {unreadCount > 0 && (
                        <div
                            className="absolute -top-1 -right-1 flex items-center justify-center size-4 rounded-full bg-red-500 text-white text-[10px] font-bold"
                            aria-label={`${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
                        >
                            !
                        </div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-1">
                <div className="flex items-baseline justify-between gap-4 px-3 py-2">
                    <div className="text-sm font-semibold">Notifications</div>
                    {unreadCount > 0 && (
                        <button
                            className="text-xs font-medium hover:underline"
                            onClick={handleMarkAllAsRead}
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
                <div
                    role="separator"
                    aria-orientation="horizontal"
                    className="bg-border -mx-1 my-1 h-px"
                ></div>
                {isLoading ? (
                    <div className="px-3 py-4 text-center">
                        <div className="text-sm text-muted-foreground">
                            Loading notifications...
                        </div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="px-3 py-4 text-center">
                        <div className="text-sm text-muted-foreground">
                            No notifications yet
                        </div>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className="hover:bg-accent rounded-md px-3 py-2 text-sm transition-colors"
                        >
                            <div className="relative flex items-start pe-3">
                                <div className="flex-1 space-y-1">
                                    <button
                                        className="text-foreground/80 text-left after:absolute after:inset-0"
                                        onClick={() => handleNotificationClick(notification.id)}
                                    >
                    <span className="text-foreground font-medium hover:underline">
                      {notification.metadata?.title || 'Task'}
                    </span>{' '}
                                        {notification.payload}{' '}
                                        <span className="text-foreground font-medium hover:underline">
                      {notification.title}
                    </span>
                                        .
                                    </button>
                                    <div className="text-muted-foreground text-xs">
                                        {formatNotificationDate(notification.createdAt)}
                                    </div>
                                </div>
                                {notification.status === NotificationStatus.UNREAD && (
                                    <div className="absolute end-0 self-center">
                                        <span className="sr-only">Unread</span>
                                        <Dot />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </PopoverContent>
        </Popover>
    )
}
