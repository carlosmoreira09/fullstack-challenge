import { Navigate, useRouter } from '@tanstack/react-router'
import { useAuth } from '@/hooks/auth'
import AppLayout from '@/pages/AppLayout'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: router.state.location.href }} replace />
  }

  return <AppLayout />
}
