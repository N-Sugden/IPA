import { UserRole } from '../types'

const STORAGE_KEY = 'ipa-mock-auth-role'

export const login = (role: UserRole) => {
  localStorage.setItem(STORAGE_KEY, role)
  return role
}

export const logout = () => {
  localStorage.removeItem(STORAGE_KEY)
}

export const getStoredRole = (): UserRole | null => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'Mitarbeiter' || stored === 'Lernender') {
    return stored
  }
  return null
}

export const buildAuthHeaders = (role: UserRole | null): HeadersInit => ({
  'Content-Type': 'application/json',
  ...(role ? { 'X-Role': role } : {}),
})
