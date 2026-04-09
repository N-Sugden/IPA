export type UserRole = 'Mitarbeiter' | 'Lernender'

export interface AuthState {
  role: UserRole | null
  isAuthenticated: boolean
}
