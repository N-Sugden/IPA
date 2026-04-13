import { ObjectType } from '../types'
import { getStoredRole, buildAuthHeaders } from './auth'

const BASE_URL = 'http://172.17.13.30:3000/api'

const getHeaders = (): HeadersInit => {
  const role = getStoredRole()
  return buildAuthHeaders(role)
}

export const getObjectTypes = async (): Promise<ObjectType[]> => {
  const response = await fetch(`${BASE_URL}/object-types`, {
    method: 'GET',
    headers: getHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch object types: ${response.statusText}`)
  }
  return response.json()
}

export const getObjectType = async (id: string): Promise<ObjectType> => {
  const response = await fetch(`${BASE_URL}/object-types/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch object type: ${response.statusText}`)
  }
  return response.json()
}

export const createObjectType = async (name: string): Promise<ObjectType> => {
  const response = await fetch(`${BASE_URL}/object-types`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name }),
  })
  if (!response.ok) {
    throw new Error(`Failed to create object type: ${response.statusText}`)
  }
  return response.json()
}

export const updateObjectType = async (id: string, name: string): Promise<ObjectType> => {
  const response = await fetch(`${BASE_URL}/object-types/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ name }),
  })
  if (!response.ok) {
    throw new Error(`Failed to update object type: ${response.statusText}`)
  }
  return response.json()
}

export const deleteObjectType = async (id: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/object-types/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Failed to delete object type: ${response.statusText}`)
  }
}
