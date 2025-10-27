export interface User {
  id: string
  name: string
  email: string
  password?: string
  document?: string
  birthday?: string
  role?: string
  createdAt?: string
  updatedAt?: string
  createdById?: number
}

export interface CreateUserDto {
  name: string
  email: string
  password: string
  document?: string
  birthday?: string
  role?: string
}

export interface UpdateUserDto {
  id: string
  name?: string
  email?: string
  password?: string
  document?: string
  birthday?: string
  role?: string
}
