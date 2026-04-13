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

export interface ObjectType {
  id: string
  name: string
}

export interface RoomObject {
  id: string
  roomId: string
  objectTypeId: string
  objectTypeName: string
  name?: string
  width: number
  length: number
  positionX: number
  positionY: number
  rotation: number
  createdAt: string
  updatedAt: string
}
