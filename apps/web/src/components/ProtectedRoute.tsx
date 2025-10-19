import { Navigate, useRouter } from '@tanstack/react-router'
import { useAuth } from '@/hooks/auth'
import AppLayout from '@/pages/AppLayout'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  if (!isAuthenticated) {
    // Redireciona para a página de login, salvando a rota atual
    return <Navigate to="/login" search={{ redirect: router.state.location.href }} replace />
  }

  return <AppLayout />
}
