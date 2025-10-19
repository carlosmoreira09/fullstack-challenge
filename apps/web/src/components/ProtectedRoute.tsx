import { Navigate, useRouter } from '@tanstack/react-router'
import { useAuth } from '@/hooks/auth'
import React from "react";

interface ProtectedRouteProps {
  children?: React.ReactNode
}

export function ProtectedRoute({ children = null }: ProtectedRouteProps = {}) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  if (!isAuthenticated) {
    // Redireciona para a página de login, salvando a rota atual
    return <Navigate to="/login" search={{ redirect: router.state.location.href }} replace />
  }

  return <>{children}</>
}
