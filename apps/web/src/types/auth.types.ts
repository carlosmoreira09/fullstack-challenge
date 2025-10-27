export interface LoginDTO {
  username: string;
  password: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
}

export interface DecodedToken {
  sub: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp: number;
}

export interface IAuthContext {
  login: (data: LoginDTO) => Promise<AuthResponse | null>;
  logout: () => void;
  decoded: DecodedToken | null;
  userId: string | null;
}
