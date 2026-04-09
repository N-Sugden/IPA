export type UserRole = 'Mitarbeiter' | 'Lernender'

export interface AuthState {
  role: UserRole | null
  isAuthenticated: boolean
}

export interface Room {
  id: string
  name: string
  width: number
  length: number
  createdAt: string
  updatedAt: string
}
