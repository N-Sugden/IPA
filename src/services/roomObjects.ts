import { RoomObject } from '../types'
import { getStoredRole, buildAuthHeaders } from './auth'

const BASE_URL = 'http://172.17.13.30:3000/api'

const getHeaders = (): HeadersInit => {
  const role = getStoredRole()
  return buildAuthHeaders(role)
}

export interface RoomObjectPayload {
  objectTypeId: string
  name?: string
  width: number
  length: number
  positionX: number
  positionY: number
  rotation?: number
}

export const getRoomObjects = async (roomId: string): Promise<RoomObject[]> => {
  const response = await fetch(`${BASE_URL}/rooms/${roomId}/objects`, {
    method: 'GET',
    headers: getHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch room objects: ${response.statusText}`)
  }
  return response.json()
}

export const getRoomObject = async (roomId: string, id: string): Promise<RoomObject> => {
  const response = await fetch(`${BASE_URL}/rooms/${roomId}/objects/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch room object: ${response.statusText}`)
  }
  return response.json()
}

export const createRoomObject = async (roomId: string, roomObject: RoomObjectPayload): Promise<RoomObject> => {
  const response = await fetch(`${BASE_URL}/rooms/${roomId}/objects`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(roomObject),
  })
  if (!response.ok) {
    throw new Error(`Failed to create room object: ${response.statusText}`)
  }
  return response.json()
}

export const updateRoomObject = async (
  roomId: string,
  id: string,
  roomObject: RoomObjectPayload,
): Promise<RoomObject> => {
  const response = await fetch(`${BASE_URL}/rooms/${roomId}/objects/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(roomObject),
  })
  if (!response.ok) {
    throw new Error(`Failed to update room object: ${response.statusText}`)
  }
  return response.json()
}

export const deleteRoomObject = async (roomId: string, id: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/rooms/${roomId}/objects/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to delete room object: ${response.statusText}`)
  }
}
