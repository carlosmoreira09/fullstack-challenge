import { Navigate, createRoute, useRouter } from '@tanstack/react-router'
import { useAuth } from '@/hooks/auth'
import AppLayout from '@/pages/AppLayout'
import { rootRoute } from '@/routes/__root.tsx'

export const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: ProtectedRoute,
})

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        search={{ redirect: router.state.location.href }}
        replace
      />
    )
  }

  return <AppLayout />
}
