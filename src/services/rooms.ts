import { Room } from '../types'
import { getStoredRole, buildAuthHeaders } from './auth'

const BASE_URL = 'http://172.17.13.30:3000/api'

const getHeaders = (): HeadersInit => {
  const role = getStoredRole()
  return buildAuthHeaders(role)
}

export const getRooms = async (): Promise<Room[]> => {
  const response = await fetch(`${BASE_URL}/rooms`, {
    method: 'GET',
    headers: getHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch rooms: ${response.statusText}`)
  }
  return response.json()
}

export const getRoom = async (id: string): Promise<Room> => {
  const response = await fetch(`${BASE_URL}/rooms/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch room: ${response.statusText}`)
  }
  return response.json()
}

export const createRoom = async (room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<Room> => {
  const response = await fetch(`${BASE_URL}/rooms`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(room),
  })
  if (!response.ok) {
    throw new Error(`Failed to create room: ${response.statusText}`)
  }
  return response.json()
}

export const updateRoom = async (id: string, room: Partial<Omit<Room, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Room> => {
  const response = await fetch(`${BASE_URL}/rooms/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(room),
  })
  if (!response.ok) {
    throw new Error(`Failed to update room: ${response.statusText}`)
  }
  return response.json()
}

export const deleteRoom = async (id: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/rooms/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to delete room: ${response.statusText}`)
  }
}
