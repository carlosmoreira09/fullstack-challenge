import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import type { AuthResponse, DecodedToken, LoginDTO } from '@/types'
import { AuthContext } from '@/context/context.ts'
import { authService } from '@/service/auth.service.ts'

export type Props = {
  children?: React.ReactNode
}

const AuthProvider = ({ children }: Props) => {
  const [decoded, setDecoded] = useState<DecodedToken | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const loginService = useMemo(() => authService(), [])

  const handleAuthSuccess = useCallback((response: AuthResponse) => {
    const decodedToken = jwtDecode<DecodedToken>(response.token)
    setDecoded(decodedToken)
    setUserId(decodedToken.userId)
    setToken(response.token)
    setIsAuthenticated(true)

    Cookies.set('token', response.token)
    Cookies.set('refreshToken', response.refreshToken)
  }, [])

  const clearAuthState = useCallback(() => {
    Cookies.remove('token')
    Cookies.remove('refreshToken')
    setToken('')
    setDecoded(null)
    setUserId('')
    setIsAuthenticated(false)
  }, [])

  const restoreSessionFromCookies = useCallback(async () => {
    const authToken = Cookies.get('token')
    const refreshToken = Cookies.get('refreshToken')

    if (!authToken && !refreshToken) {
      clearAuthState()
      return
    }

    try {
      if (authToken) {
        const decodedToken = jwtDecode<DecodedToken>(authToken)
        const isExpired = decodedToken.exp * 1000 < Date.now()

        if (isExpired && refreshToken) {
          const response = await loginService.refresh()
          if (response && response.token && response.refreshToken) {
            handleAuthSuccess(response)
            return
          }
          clearAuthState()
          return
        }

        if (!isExpired) {
          setDecoded(decodedToken)
          setToken(authToken)
          setUserId(decodedToken.userId)
          setIsAuthenticated(true)
          return
        }
      }
      clearAuthState()
    } catch (error) {
      clearAuthState()
    }
  }, [clearAuthState, loginService, handleAuthSuccess])

  useEffect(() => {
    void restoreSessionFromCookies()
  }, [restoreSessionFromCookies])

  useEffect(() => {
    if (!decoded || !isAuthenticated) return

    const expiresAt = decoded.exp * 1000
    const now = Date.now()
    const timeUntilExpiry = expiresAt - now
    const refreshBuffer = 2 * 60 * 1000 // 2 minutos
    const timeUntilRefresh = Math.max(0, timeUntilExpiry - refreshBuffer)

    const timerId = setTimeout(() => {
      void refreshAccessToken()
    }, timeUntilRefresh)

    return () => clearTimeout(timerId)
  }, [decoded, isAuthenticated])

  const login = useCallback(
    async (logindData: LoginDTO) => {
      const response = await loginService.login(logindData)
      if (response && response.token && response.refreshToken) {
        handleAuthSuccess(response)
        return response
      }
      clearAuthState()
      return null
    },
    [loginService, handleAuthSuccess, clearAuthState],
  )

  const refreshAccessToken = useCallback(async () => {
    if (isRefreshing) {
      return null
    }

    setIsRefreshing(true)
    try {
      const response = await loginService.refresh()
      if (response && response.token && response.refreshToken) {
        handleAuthSuccess(response)
        return response
      }
      clearAuthState()
      return null
    } finally {
      setIsRefreshing(false)
    }
  }, [clearAuthState, handleAuthSuccess, isRefreshing, loginService])

  const logout = useCallback(() => {
    clearAuthState()
  }, [clearAuthState])

  const value = useMemo(
    () => ({
      userId,
      decoded,
      login,
      logout,
      token,
      isAuthenticated,
      refreshAccessToken,
    }),
    [
      userId,
      token,
      decoded,
      login,
      logout,
      isAuthenticated,
      refreshAccessToken,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
