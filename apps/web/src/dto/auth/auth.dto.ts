export interface IAuthContext {
  userId: string
  decoded: DecodedToken | null
  login: (user: LoginData) => Promise<AuthResponse | null>
  logout: () => void
  token: string
  isAuthenticated: boolean
  refreshAccessToken: () => Promise<AuthResponse | null>
}


export interface LoginData {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
}

export interface DecodedToken {
  userId: string
  email: string
  role: string
  exp: number
}
