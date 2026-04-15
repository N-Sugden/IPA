import React, { useEffect, useRef, useState } from 'react'
import { Room, ObjectType, RoomObject, UserRole } from '../types'
import RoleBadge from '../components/RoleBadge'
import CrudModal from '../components/CrudModal'
import RoomPreview from '../components/RoomPreview'
import {
  createRoom,
  deleteRoom,
  getRooms,
  updateRoom,
} from '../services/rooms'
import {
  createObjectType,
  deleteObjectType,
  getObjectTypes,
  updateObjectType,
} from '../services/objectTypes'
import {
  createRoomObject,
  deleteRoomObject,
  getRoomObjects,
  updateRoomObject,
} from '../services/roomObjects'

interface DashboardPageProps {
  role: UserRole
  onLogout: () => void
}

type OpenModal = 'rooms' | 'objectTypes' | 'roomObjects' | null

const DashboardPage = ({ role, onLogout }: DashboardPageProps) => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<string>('')
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [roomError, setRoomError] = useState<string | null>(null)

  const [objectTypes, setObjectTypes] = useState<ObjectType[]>([])
  const [loadingObjectTypes, setLoadingObjectTypes] = useState(true)
  const [objectTypeError, setObjectTypeError] = useState<string | null>(null)

  const [roomObjects, setRoomObjects] = useState<RoomObject[]>([])
  const [loadingRoomObjects, setLoadingRoomObjects] = useState(true)
  const [roomObjectError, setRoomObjectError] = useState<string | null>(null)
  const [allRoomObjects, setAllRoomObjects] = useState<RoomObject[]>([])

  const [openModal, setOpenModal] = useState<OpenModal>(null)

  const [roomModalId, setRoomModalId] = useState<string>('')
  const [roomModalName, setRoomModalName] = useState('')
  const [roomModalWidth, setRoomModalWidth] = useState('')
  const [roomModalLength, setRoomModalLength] = useState('')
  const [roomModalMessage, setRoomModalMessage] = useState<string | null>(null)
  const [roomModalError, setRoomModalError] = useState<string | null>(null)

  const [objectTypeModalId, setObjectTypeModalId] = useState<string>('')
  const [objectTypeModalName, setObjectTypeModalName] = useState('')
  const [objectTypeModalMessage, setObjectTypeModalMessage] = useState<string | null>(null)
  const [objectTypeModalError, setObjectTypeModalError] = useState<string | null>(null)

  const [objectModalId, setObjectModalId] = useState<string>('')
  const [objectModalName, setObjectModalName] = useState('')
  const [objectModalTypeId, setObjectModalTypeId] = useState('')
  const [objectModalRoomId, setObjectModalRoomId] = useState('')
  const [objectModalWidth, setObjectModalWidth] = useState('')
  const [objectModalLength, setObjectModalLength] = useState('')
  const [objectModalPositionX, setObjectModalPositionX] = useState('')
  const [objectModalPositionY, setObjectModalPositionY] = useState('')
  const [objectModalMessage, setObjectModalMessage] = useState<string | null>(null)
  const [objectModalError, setObjectModalError] = useState<string | null>(null)

  const [selectedRoomObjectId, setSelectedRoomObjectId] = useState<string>('')
  const [objectPreviewPositions, setObjectPreviewPositions] = useState<Record<string, { positionX: number; positionY: number }>>({})
  const [dragState, setDragState] = useState<{
    objectId: string
    offsetX: number
    offsetY: number
    objectWidth: number
    objectHeight: number
  } | null>(null)
  const roomPreviewRef = useRef<HTMLDivElement | null>(null)
  const [saving, setSaving] = useState(false)

  const refreshRooms = async (): Promise<Room[]> => {
    setLoadingRooms(true)
    setRoomError(null)

    try {
      const data = await getRooms()
      const sortedRooms = [...data].sort((a, b) => a.name.localeCompare(b.name, 'de'))
      setRooms(sortedRooms)
      return sortedRooms
    } catch (error) {
      setRoomError(error instanceof Error ? error.message : String(error))
      return []
    } finally {
      setLoadingRooms(false)
    }
  }

  const refreshObjectTypes = async (): Promise<ObjectType[]> => {
    setLoadingObjectTypes(true)
    setObjectTypeError(null)

    try {
      const data = await getObjectTypes()
      const sortedTypes = [...data].sort((a, b) => a.name.localeCompare(b.name, 'de'))
      setObjectTypes(sortedTypes)
      return sortedTypes
    } catch (error) {
      setObjectTypeError(error instanceof Error ? error.message : String(error))
      return []
    } finally {
      setLoadingObjectTypes(false)
    }
  }

  const refreshRoomObjectsForRoom = async (roomId: string): Promise<RoomObject[]> => {
    setLoadingRoomObjects(true)
    setRoomObjectError(null)

    try {
      const data = await getRoomObjects(roomId)
      setRoomObjects(data)
      return data
    } catch (error) {
      setRoomObjectError(error instanceof Error ? error.message : String(error))
      setRoomObjects([])
      return []
    } finally {
      setLoadingRoomObjects(false)
    }
  }

  const refreshAllRoomObjects = async (roomList: Room[]): Promise<RoomObject[]> => {
    if (roomList.length === 0) {
      setAllRoomObjects([])
      return []
    }

    const fetches = await Promise.all(roomList.map(room => getRoomObjects(room.id).catch(() => [])))
    const combined = fetches.flat()
    setAllRoomObjects(combined)
    return combined
  }

  useEffect(() => {
    const loadInitialData = async () => {
      const sortedRooms = await refreshRooms()
      const sortedTypes = await refreshObjectTypes()

      if (sortedRooms.length > 0) {
        setSelectedRoomId(sortedRooms[0].id)
        setObjectModalRoomId(sortedRooms[0].id)
        await refreshRoomObjectsForRoom(sortedRooms[0].id)
      }

      if (sortedTypes.length > 0) {
        setObjectModalTypeId(sortedTypes[0].id)
      }

      await refreshAllRoomObjects(sortedRooms)
    }

    loadInitialData()
  }, [])

  useEffect(() => {
    if (openModal === 'roomObjects' && objectModalRoomId) {
      refreshRoomObjectsForRoom(objectModalRoomId)
    }
  }, [openModal, objectModalRoomId])

  useEffect(() => {
    if (selectedRoomId) {
      refreshRoomObjectsForRoom(selectedRoomId)
      setSelectedRoomObjectId('')
    }
  }, [selectedRoomId])

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId)
  }

  const getObjectPreviewPosition = (object: RoomObject) => {
    return objectPreviewPositions[object.id] ?? {
      positionX: object.positionX,
      positionY: object.positionY,
    }
  }

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

  const buildBounds = (positionX: number, positionY: number, width: number, length: number) => ({
    left: positionX,
    right: positionX + width,
    bottom: positionY,
    top: positionY + length,
  })

  const rectanglesOverlap = (
    a: { left: number; right: number; bottom: number; top: number },
    b: { left: number; right: number; bottom: number; top: number }
  ) => a.left < b.right && a.right > b.left && a.bottom < b.top && a.top > b.bottom

  const getRoomObjectPreviewBounds = (object: RoomObject) => {
    const previewPos = getObjectPreviewPosition(object)
    return buildBounds(previewPos.positionX, previewPos.positionY, object.width, object.length)
  }

  const hasCollisionWithOtherObjects = (
    roomId: string,
    positionX: number,
    positionY: number,
    width: number,
    length: number,
    excludeObjectId?: string,
  ) => {
    const bounds = buildBounds(positionX, positionY, width, length)
    return roomObjects
      .filter(item => item.roomId === roomId && item.id !== excludeObjectId)
      .some(item => rectanglesOverlap(bounds, getRoomObjectPreviewBounds(item)))
  }

  const isPositionWithinRoom = (
    roomId: string,
    positionX: number,
    positionY: number,
    width: number,
    length: number,
  ) => {
    const room = rooms.find(item => item.id === roomId)
    if (!room) {
      return false
    }
    return (
      positionX >= 0 &&
      positionY >= 0 &&
      positionX + width <= room.width &&
      positionY + length <= room.length
    )
  }

  const startDragObject = (object: RoomObject, event: React.PointerEvent<HTMLDivElement>) => {
    const preview = roomPreviewRef.current
    if (!preview) {
      return
    }

    event.preventDefault()
    setSelectedRoomObjectId(object.id)

    const rect = preview.getBoundingClientRect()
    const previewPos = getObjectPreviewPosition(object)
    const objectWidth = object.width
    const objectHeight = object.length
    const pointerX = event.clientX - rect.left
    const pointerY = event.clientY - rect.top
    const currentLeft = previewPos.positionX
    const currentTop = rect.height - previewPos.positionY - objectHeight
    const offsetX = pointerX - currentLeft
    const offsetY = pointerY - currentTop

    setDragState({
      objectId: object.id,
      offsetX,
      offsetY,
      objectWidth,
      objectHeight,
    })

    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveDraggedObject = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState || !roomPreviewRef.current || !selectedRoomId) {
      return
    }

    const preview = roomPreviewRef.current
    const rect = preview.getBoundingClientRect()
    const pointerX = event.clientX - rect.left
    const pointerY = event.clientY - rect.top
    const newLeft = clamp(pointerX - dragState.offsetX, 0, rect.width - dragState.objectWidth)
    const newTop = clamp(pointerY - dragState.offsetY, 0, rect.height - dragState.objectHeight)
    const newBottom = rect.height - dragState.objectHeight - newTop

    if (
      !isPositionWithinRoom(selectedRoomId, newLeft, newBottom, dragState.objectWidth, dragState.objectHeight) ||
      hasCollisionWithOtherObjects(
        selectedRoomId,
        newLeft,
        newBottom,
        dragState.objectWidth,
        dragState.objectHeight,
        dragState.objectId,
      )
    ) {
      return
    }

    setObjectPreviewPositions(prev => ({
      ...prev,
      [dragState.objectId]: {
        positionX: newLeft,
        positionY: newBottom,
      },
    }))
  }

  const stopDragging = () => {
    setDragState(null)
  }

  const hasPreviewChanges = Object.entries(objectPreviewPositions).some(([objectId, previewPos]) => {
    const object = roomObjects.find(item => item.id === objectId)
    return object ? object.positionX !== previewPos.positionX || object.positionY !== previewPos.positionY : false
  })

  const saveFloorplan = async () => {
    if (!selectedRoom || saving || !hasPreviewChanges) {
      return
    }

    setSaving(true)
    try {
      const updates = roomObjects
        .filter(object => object.roomId === selectedRoom.id)
        .map(object => {
          const previewPos = getObjectPreviewPosition(object)
          return updateRoomObject(object.roomId, object.id, {
            objectTypeId: object.objectTypeId,
            name: object.name ?? '',
            width: object.width,
            length: object.length,
            positionX: previewPos.positionX,
            positionY: previewPos.positionY,
            rotation: object.rotation,
          })
        })

      await Promise.all(updates)
      await refreshRoomObjectsForRoom(selectedRoom.id)
      setObjectPreviewPositions({})
    } catch (error) {
      setRoomObjectError(error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

  const openRoomModal = () => {
    setRoomModalMessage(null)
    setRoomModalError(null)

    if (rooms.length > 0) {
      const room = rooms.find(item => item.id === selectedRoomId) ?? rooms[0]
      setRoomModalId(room.id)
      setRoomModalName(room.name)
      setRoomModalWidth(String(room.width))
      setRoomModalLength(String(room.length))
    } else {
      setRoomModalId('')
      setRoomModalName('')
      setRoomModalWidth('')
      setRoomModalLength('')
    }

    setOpenModal('rooms')
  }

  const openObjectTypeModal = () => {
    setObjectTypeModalMessage(null)
    setObjectTypeModalError(null)

    if (objectTypes.length > 0) {
      const type = objectTypes[0]
      setObjectTypeModalId(type.id)
      setObjectTypeModalName(type.name)
    } else {
      setObjectTypeModalId('')
      setObjectTypeModalName('')
    }

    setOpenModal('objectTypes')
  }

  const openRoomObjectModal = () => {
    setObjectModalMessage(null)
    setObjectModalError(null)

    const roomId = selectedRoomId || rooms[0]?.id || ''
    setObjectModalRoomId(roomId)
    if (!objectModalTypeId && objectTypes.length > 0) {
      setObjectModalTypeId(objectTypes[0].id)
    }

    if (rooms.length > 0 && !roomId) {
      setObjectModalRoomId(rooms[0].id)
    }

    setObjectModalId('')
    setObjectModalName('')
    setObjectModalWidth('')
    setObjectModalLength('')
    setObjectModalPositionX('')
    setObjectModalPositionY('')

    setOpenModal('roomObjects')
  }

  const resetRoomModalState = () => {
    setRoomModalMessage(null)
    setRoomModalError(null)
  }

  const resetObjectTypeModalState = () => {
    setObjectTypeModalMessage(null)
    setObjectTypeModalError(null)
  }

  const resetRoomObjectModalState = () => {
    setObjectModalMessage(null)
    setObjectModalError(null)
  }

  const validateRoomFields = () => {
    if (!roomModalName.trim()) {
      return 'Raumname ist erforderlich.'
    }
    if (!roomModalWidth.trim() || Number.isNaN(Number(roomModalWidth)) || Number(roomModalWidth) <= 0) {
      return 'Raumbreite muss eine positive Zahl sein.'
    }
    if (!roomModalLength.trim() || Number.isNaN(Number(roomModalLength)) || Number(roomModalLength) <= 0) {
      return 'Raumlänge muss eine positive Zahl sein.'
    }
    return null
  }

  const validateObjectTypeFields = () => {
    if (!objectTypeModalName.trim()) {
      return 'Name des Möbeltyps ist erforderlich.'
    }
    return null
  }

  const validateRoomObjectFields = () => {
    if (!objectModalName.trim()) {
      return 'Name des Möbels ist erforderlich.'
    }
    if (!objectModalTypeId) {
      return 'Bitte wählen Sie einen Möbeltyp.'
    }
    if (!objectModalRoomId) {
      return 'Bitte wählen Sie einen Raum.'
    }
    if (!objectModalWidth.trim() || Number.isNaN(Number(objectModalWidth)) || Number(objectModalWidth) <= 0) {
      return 'Objektbreite muss eine positive Zahl sein.'
    }
    if (!objectModalLength.trim() || Number.isNaN(Number(objectModalLength)) || Number(objectModalLength) <= 0) {
      return 'Objektlänge muss eine positive Zahl sein.'
    }
    if (!objectModalPositionX.trim() || Number.isNaN(Number(objectModalPositionX)) || Number(objectModalPositionX) < 0) {
      return 'Position X muss eine Zahl >= 0 sein.'
    }
    if (!objectModalPositionY.trim() || Number.isNaN(Number(objectModalPositionY)) || Number(objectModalPositionY) < 0) {
      return 'Position Y muss eine Zahl >= 0 sein.'
    }
    return null
  }

  const handleRoomSelectInModal = (roomId: string) => {
    const room = rooms.find(item => item.id === roomId)
    if (!room) return
    setRoomModalId(room.id)
    setRoomModalName(room.name)
    setRoomModalWidth(String(room.width))
    setRoomModalLength(String(room.length))
  }

  const handleObjectTypeSelectInModal = (typeId: string) => {
    const type = objectTypes.find(item => item.id === typeId)
    if (!type) return
    setObjectTypeModalId(type.id)
    setObjectTypeModalName(type.name)
  }

  const handleRoomObjectSelectInModal = (objectId: string) => {
    const object = roomObjects.find(item => item.id === objectId)
    if (!object) return
    setObjectModalId(object.id)
    setObjectModalName(object.name ?? '')
    setObjectModalTypeId(object.objectTypeId)
    setObjectModalRoomId(object.roomId)
    setObjectModalWidth(String(object.width))
    setObjectModalLength(String(object.length))
    setObjectModalPositionX(String(object.positionX))
    setObjectModalPositionY(String(object.positionY))
  }

  const handleCreateRoom = async () => {
    resetRoomModalState()
    const validationError = validateRoomFields()
    if (validationError) {
      setRoomModalError(validationError)
      return
    }

    setSaving(true)

    try {
      const createdRoom = await createRoom({
        name: roomModalName.trim(),
        width: Number(roomModalWidth),
        length: Number(roomModalLength),
      })

      const sortedRooms = await refreshRooms()
      setSelectedRoomId(createdRoom.id)
      setRoomModalId(createdRoom.id)
      setRoomModalMessage('Raum wurde erstellt.')
      const created = sortedRooms.find(room => room.id === createdRoom.id)
      if (created) {
        setRoomModalName(created.name)
        setRoomModalWidth(String(created.width))
        setRoomModalLength(String(created.length))
      }
      await refreshAllRoomObjects(sortedRooms)
    } catch (error) {
      setRoomModalError(error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateRoom = async () => {
    resetRoomModalState()
    if (!roomModalId) {
      setRoomModalError('Bitte wählen Sie einen Raum aus der Liste.')
      return
    }

    const validationError = validateRoomFields()
    if (validationError) {
      setRoomModalError(validationError)
      return
    }

    setSaving(true)

    try {
      const updatedRoom = await updateRoom(roomModalId, {
        name: roomModalName.trim(),
        width: Number(roomModalWidth),
        length: Number(roomModalLength),
      })

      const sortedRooms = await refreshRooms()
      setSelectedRoomId(updatedRoom.id)
      setRoomModalId(updatedRoom.id)
      setRoomModalMessage('Raum wurde aktualisiert.')
      const updated = sortedRooms.find(room => room.id === updatedRoom.id)
      if (updated) {
        setRoomModalName(updated.name)
        setRoomModalWidth(String(updated.width))
        setRoomModalLength(String(updated.length))
      }
      await refreshAllRoomObjects(sortedRooms)
    } catch (error) {
      setRoomModalError(error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRoom = async () => {
    resetRoomModalState()
    if (!roomModalId) {
      setRoomModalError('Bitte wählen Sie einen Raum aus der Liste.')
      return
    }

    setSaving(true)

    try {
      await deleteRoom(roomModalId)
      const sortedRooms = await refreshRooms()
      const nextRoom = sortedRooms[0]
      if (nextRoom) {
        setSelectedRoomId(nextRoom.id)
        setRoomModalId(nextRoom.id)
        setRoomModalName(nextRoom.name)
        setRoomModalWidth(String(nextRoom.width))
        setRoomModalLength(String(nextRoom.length))
      } else {
        setSelectedRoomId('')
        setRoomModalId('')
        setRoomModalName('')
        setRoomModalWidth('')
        setRoomModalLength('')
      }
      setRoomModalMessage('Raum wurde gelöscht.')
      await refreshAllRoomObjects(sortedRooms)
    } catch (error) {
      setRoomModalError(error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

  const handleCreateObjectType = async () => {
    resetObjectTypeModalState()
    const validationError = validateObjectTypeFields()
    if (validationError) {
      setObjectTypeModalError(validationError)
      return
    }

    setSaving(true)

    try {
      const createdType = await createObjectType(objectTypeModalName.trim())
      const sortedTypes = await refreshObjectTypes()
      setObjectTypeModalId(createdType.id)
      setObjectTypeModalMessage('Möbeltyp wurde erstellt.')
      const created = sortedTypes.find(type => type.id === createdType.id)
      if (created) {
        setObjectTypeModalName(created.name)
      }
    } catch (error) {
      setObjectTypeModalError(error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateObjectType = async () => {
    resetObjectTypeModalState()
    if (!objectTypeModalId) {
      setObjectTypeModalError('Bitte wählen Sie einen Möbeltyp aus der Liste.')
      return
    }

    const validationError = validateObjectTypeFields()
    if (validationError) {
      setObjectTypeModalError(validationError)
      return
    }

    setSaving(true)

    try {
      const updatedType = await updateObjectType(objectTypeModalId, objectTypeModalName.trim())
      await refreshObjectTypes()
      setObjectTypeModalId(updatedType.id)
      setObjectTypeModalMessage('Möbeltyp wurde aktualisiert.')
    } catch (error) {
      setObjectTypeModalError(error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteObjectType = async () => {
    resetObjectTypeModalState()
    if (!objectTypeModalId) {
      setObjectTypeModalError('Bitte wählen Sie einen Möbeltyp aus der Liste.')
      return
    }

    const inUse = allRoomObjects.some(item => item.objectTypeId === objectTypeModalId)
    if (inUse) {
      setObjectTypeModalError('Dieser Möbeltyp kann nicht gelöscht werden, weil Möbel damit vorhanden sind.')
      return
    }

    setSaving(true)

    try {
      await deleteObjectType(objectTypeModalId)
      const sortedTypes = await refreshObjectTypes()
      const nextType = sortedTypes[0]
      if (nextType) {
        setObjectTypeModalId(nextType.id)
        setObjectTypeModalName(nextType.name)
      } else {
        setObjectTypeModalId('')
        setObjectTypeModalName('')
      }
      setObjectTypeModalMessage('Möbeltyp wurde gelöscht.')
    } catch (error) {
      setObjectTypeModalError(error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

  const handleCreateRoomObject = async () => {
    resetRoomObjectModalState()
    const validationError = validateRoomObjectFields()
    if (validationError) {
      setObjectModalError(validationError)
      return
    }

    const selectedRoomForObject = rooms.find(room => room.id === objectModalRoomId)
    if (!selectedRoomForObject) {
      setObjectModalError('Der ausgewählte Raum wurde nicht gefunden.')
      return
    }

    const objectWidth = Number(objectModalWidth)
    const objectLength = Number(objectModalLength)
    const objectX = Number(objectModalPositionX)
    const objectY = Number(objectModalPositionY)

    if (objectWidth > selectedRoomForObject.width || objectLength > selectedRoomForObject.length) {
      setObjectModalError('Das Möbelstück darf nicht größer als der Raum sein.')
      return
    }
    if (objectX + objectWidth > selectedRoomForObject.width || objectY + objectLength > selectedRoomForObject.length) {
      setObjectModalError('Das Möbelstück darf den Raum nicht verlassen.')
      return
    }
    if (hasCollisionWithOtherObjects(objectModalRoomId, objectX, objectY, objectWidth, objectLength)) {
      setObjectModalError('Das Möbelstück darf sich nicht mit einem anderen Möbelstück überschneiden.')
      return
    }

    setSaving(true)

    try {
      const createdObject = await createRoomObject(objectModalRoomId, {
        objectTypeId: objectModalTypeId,
        name: objectModalName.trim(),
        width: objectWidth,
        length: objectLength,
        positionX: objectX,
        positionY: objectY,
        rotation: 0,
      })

      const updatedObjects = await refreshRoomObjectsForRoom(objectModalRoomId)
      setObjectModalId(createdObject.id)
      setObjectModalMessage('Möbel wurde erstellt.')
      const created = updatedObjects.find(obj => obj.id === createdObject.id)
      if (created) {
        setObjectModalName(created.name ?? '')
        setObjectModalTypeId(created.objectTypeId)
        setObjectModalRoomId(created.roomId)
        setObjectModalWidth(String(created.width))
        setObjectModalLength(String(created.length))
        setObjectModalPositionX(String(created.positionX))
        setObjectModalPositionY(String(created.positionY))
      }
      await refreshAllRoomObjects(rooms)
    } catch (error) {
      setObjectModalError(error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateRoomObject = async () => {
    resetRoomObjectModalState()
    if (!objectModalId) {
      setObjectModalError('Bitte wählen Sie ein Möbel aus der Liste.')
      return
    }

    const validationError = validateRoomObjectFields()
    if (validationError) {
      setObjectModalError(validationError)
      return
    }

    const selectedRoomForObject = rooms.find(room => room.id === objectModalRoomId)
    if (!selectedRoomForObject) {
      setObjectModalError('Der ausgewählte Raum wurde nicht gefunden.')
      return
    }

    const objectWidth = Number(objectModalWidth)
    const objectLength = Number(objectModalLength)
    const objectX = Number(objectModalPositionX)
    const objectY = Number(objectModalPositionY)

    if (objectWidth > selectedRoomForObject.width || objectLength > selectedRoomForObject.length) {
      setObjectModalError('Das Möbelstück darf nicht größer als der Raum sein.')
      return
    }
    if (objectX + objectWidth > selectedRoomForObject.width || objectY + objectLength > selectedRoomForObject.length) {
      setObjectModalError('Das Möbelstück darf den Raum nicht verlassen.')
      return
    }
    if (hasCollisionWithOtherObjects(objectModalRoomId, objectX, objectY, objectWidth, objectLength, objectModalId)) {
      setObjectModalError('Das Möbelstück darf sich nicht mit einem anderen Möbelstück überschneiden.')
      return
    }

    setSaving(true)

    try {
      const updatedObject = await updateRoomObject(objectModalRoomId, objectModalId, {
        objectTypeId: objectModalTypeId,
        name: objectModalName.trim(),
        width: objectWidth,
        length: objectLength,
        positionX: objectX,
        positionY: objectY,
        rotation: 0,
      })

      const updatedObjects = await refreshRoomObjectsForRoom(objectModalRoomId)
      setObjectModalId(updatedObject.id)
      setObjectModalMessage('Möbel wurde aktualisiert.')
      const updated = updatedObjects.find(obj => obj.id === updatedObject.id)
      if (updated) {
        setObjectModalName(updated.name ?? '')
        setObjectModalTypeId(updated.objectTypeId)
        setObjectModalRoomId(updated.roomId)
        setObjectModalWidth(String(updated.width))
        setObjectModalLength(String(updated.length))
        setObjectModalPositionX(String(updated.positionX))
        setObjectModalPositionY(String(updated.positionY))
      }
      await refreshAllRoomObjects(rooms)
    } catch (error) {
      setObjectModalError(error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRoomObject = async () => {
    resetRoomObjectModalState()
    if (!objectModalId) {
      setObjectModalError('Bitte wählen Sie ein Möbel aus der Liste.')
      return
    }

    setSaving(true)

    try {
      await deleteRoomObject(objectModalRoomId, objectModalId)
      const updatedObjects = await refreshRoomObjectsForRoom(objectModalRoomId)
      const nextObject = updatedObjects[0]
      if (nextObject) {
        setObjectModalId(nextObject.id)
        setObjectModalName(nextObject.name ?? '')
        setObjectModalTypeId(nextObject.objectTypeId)
        setObjectModalRoomId(nextObject.roomId)
        setObjectModalWidth(String(nextObject.width))
        setObjectModalLength(String(nextObject.length))
        setObjectModalPositionX(String(nextObject.positionX))
        setObjectModalPositionY(String(nextObject.positionY))
      } else {
        setObjectModalId('')
        setObjectModalName('')
        setObjectModalWidth('')
        setObjectModalLength('')
        setObjectModalPositionX('')
        setObjectModalPositionY('')
      }
      setObjectModalMessage('Möbel wurde gelöscht.')
      await refreshAllRoomObjects(rooms)
    } catch (error) {
      setObjectModalError(error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

  const typeDeleteDisabled = objectTypeModalId
    ? allRoomObjects.some(item => item.objectTypeId === objectTypeModalId)
    : false

  const roomObjectItems = roomObjects.map(object => ({
    id: object.id,
    label: `${object.name || object.objectTypeName} (${object.objectTypeName})`,
  }))

  const roomItemList = rooms.map(room => ({ id: room.id, label: room.name }))
  const objectTypeItemList = objectTypes.map(type => ({ id: type.id, label: type.name }))

  const selectedRoom = rooms.find(room => room.id === selectedRoomId)
  const roomPreviewStyle = selectedRoom
    ? {
        width: `${selectedRoom.width}px`,
        height: `${selectedRoom.length}px`,
      }
    : undefined
  const selectedRoomObject = roomObjects.find(object => object.id === selectedRoomObjectId)

  return (
    <>
      <header className="app-header">
        <img src="/logo.png" alt="Logo" className="logo" />
        <div className="user-info">
          <RoleBadge role={role} />
          <button type="button" className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="page dashboard-page">
        <section className="dashboard-top">
          <div className="top-row">
            <label className="room-select">
              <span className="visually-hidden">Raum wählen</span>
              <select value={selectedRoomId} onChange={event => handleRoomSelect(event.target.value)}>
                {loadingRooms ? (
                  <option>Lade Räume...</option>
                ) : rooms.length === 0 ? (
                  <option>Keine Räume verfügbar</option>
                ) : (
                  rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))
                )}
              </select>
            </label>

            {role === 'Mitarbeiter' ? (
              <div className="top-buttons">
                <button type="button" className="top-button" onClick={openRoomModal}>
                  Raum
                </button>
                <button type="button" className="top-button" onClick={openObjectTypeModal}>
                  Möbeltyp
                </button>
                <button type="button" className="top-button" onClick={openRoomObjectModal}>
                  Möbel
                </button>
              </div>
            ) : null}
          </div>

          {roomError ? <p className="dashboard-error">Fehler beim Laden der Räume: {roomError}</p> : null}
        </section>

        <section className="dashboard-main">
          <div className="room-display-panel">
            {selectedRoom ? (
              <RoomPreview
                ref={roomPreviewRef}
                selectedRoom={selectedRoom}
                roomObjects={roomObjects}
                selectedRoomObjectId={selectedRoomObjectId}
                selectedRoomObject={selectedRoomObject}
                roomPreviewStyle={roomPreviewStyle}
                getObjectPreviewPosition={getObjectPreviewPosition}
                onStartDragObject={startDragObject}
                onMoveDraggedObject={moveDraggedObject}
                onStopDragging={stopDragging}
                saveFloorplan={saveFloorplan}
                hasPreviewChanges={hasPreviewChanges}
                saving={saving}
              />
            ) : (
              <p>Bitte wählen Sie einen Raum aus, um ihn als Fläche anzuzeigen.</p>
            )}
          </div>
        </section>
      </main>

      <CrudModal
        title="Raumverwaltung"
        open={openModal === 'rooms'}
        onClose={() => setOpenModal(null)}
        listTitle="Räume"
        items={roomItemList}
        selectedId={roomModalId}
        onSelect={handleRoomSelectInModal}
        actions={[
          { label: 'Neuen Raum erstellen', onClick: handleCreateRoom, disabled: saving },
          { label: 'Update Raum', onClick: handleUpdateRoom, disabled: saving },
          { label: 'Raum löschen', onClick: handleDeleteRoom, variant: 'danger', disabled: saving },
        ]}
        status={{ message: roomModalMessage ?? undefined, error: roomModalError ?? undefined }}
      >
        <label className="field-label">
          Raumname
          <input value={roomModalName} onChange={event => setRoomModalName(event.target.value)} />
        </label>
        <div className="room-dimensions">
          <label className="field-label">
            Raumbreite
            <input value={roomModalWidth} onChange={event => setRoomModalWidth(event.target.value)} />
          </label>
          <label className="field-label">
            Raumlänge
            <input value={roomModalLength} onChange={event => setRoomModalLength(event.target.value)} />
          </label>
        </div>
      </CrudModal>

      <CrudModal
        title="Möbeltyp Verwaltung"
        open={openModal === 'objectTypes'}
        onClose={() => setOpenModal(null)}
        listTitle="Möbeltypen"
        items={objectTypeItemList}
        selectedId={objectTypeModalId}
        onSelect={handleObjectTypeSelectInModal}
        actions={[
          { label: 'Neuen Möbeltyp erstellen', onClick: handleCreateObjectType, disabled: saving },
          { label: 'Update Möbeltyp', onClick: handleUpdateObjectType, disabled: saving },
          { label: 'Möbeltyp löschen', onClick: handleDeleteObjectType, variant: 'danger', disabled: saving || typeDeleteDisabled },
        ]}
        status={{ message: objectTypeModalMessage ?? undefined, error: objectTypeModalError ?? undefined }}
      >
        <label className="field-label">
          Name
          <input value={objectTypeModalName} onChange={event => setObjectTypeModalName(event.target.value)} />
        </label>
        {typeDeleteDisabled ? (
          <p className="room-error">Dieser Möbeltyp ist noch in Gebrauch und kann nicht gelöscht werden.</p>
        ) : null}
      </CrudModal>

      <CrudModal
        title="Möbelverwaltung"
        open={openModal === 'roomObjects'}
        onClose={() => setOpenModal(null)}
        listTitle="Möbel"
        items={roomObjectItems}
        selectedId={objectModalId}
        onSelect={handleRoomObjectSelectInModal}
        actions={[
          { label: 'Neues Möbel erstellen', onClick: handleCreateRoomObject, disabled: saving },
          { label: 'Update Möbel', onClick: handleUpdateRoomObject, disabled: saving },
          { label: 'Möbel löschen', onClick: handleDeleteRoomObject, variant: 'danger', disabled: saving },
        ]}
        status={{ message: objectModalMessage ?? undefined, error: objectModalError ?? undefined }}
      >
        <label className="field-label">
          Name
          <input value={objectModalName} onChange={event => setObjectModalName(event.target.value)} />
        </label>

        <label className="field-label">
          Möbeltyp
          <select value={objectModalTypeId} onChange={event => setObjectModalTypeId(event.target.value)}>
            {loadingObjectTypes ? (
              <option>Lade Möbeltypen...</option>
            ) : objectTypes.length === 0 ? (
              <option>Keine Möbeltypen verfügbar</option>
            ) : (
              objectTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="field-label">
          Raum
          <select value={objectModalRoomId} onChange={event => setObjectModalRoomId(event.target.value)}>
            {loadingRooms ? (
              <option>Lade Räume...</option>
            ) : rooms.length === 0 ? (
              <option>Keine Räume verfügbar</option>
            ) : (
              rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))
            )}
          </select>
        </label>

        <div className="room-dimensions">
          <label className="field-label">
            Objektbreite
            <input value={objectModalWidth} onChange={event => setObjectModalWidth(event.target.value)} />
          </label>
          <label className="field-label">
            Objektlänge
            <input value={objectModalLength} onChange={event => setObjectModalLength(event.target.value)} />
          </label>
        </div>

        <div className="room-dimensions">
          <label className="field-label">
            Position X
            <input value={objectModalPositionX} onChange={event => setObjectModalPositionX(event.target.value)} />
          </label>
          <label className="field-label">
            Position Y
            <input value={objectModalPositionY} onChange={event => setObjectModalPositionY(event.target.value)} />
          </label>
        </div>
      </CrudModal>
    </>
  )
}

export default DashboardPage
