import React, { useEffect, useState } from 'react'
import { Room, UserRole } from '../types'
import RoleBadge from '../components/RoleBadge'
import { createRoom, deleteRoom, getRooms, updateRoom } from '../services/rooms'

interface DashboardPageProps {
  role: UserRole
  onLogout: () => void
}

const DashboardPage = ({ role, onLogout }: DashboardPageProps) => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<string>('')
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [roomError, setRoomError] = useState<string | null>(null)
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [popupRoomId, setPopupRoomId] = useState<string>('')
  const [roomName, setRoomName] = useState('')
  const [roomWidth, setRoomWidth] = useState('')
  const [roomLength, setRoomLength] = useState('')
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const refreshRooms = async () => {
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

  useEffect(() => {
    const loadRooms = async () => {
      const sortedRooms = await refreshRooms()
      if (sortedRooms.length > 0) {
        setSelectedRoomId(sortedRooms[0].id)
        setPopupRoomId(sortedRooms[0].id)
        setRoomName(sortedRooms[0].name)
        setRoomWidth(String(sortedRooms[0].width))
        setRoomLength(String(sortedRooms[0].length))
      }
    }

    loadRooms()
  }, [])

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId)
  }

  const handlePopupRoomSelect = (roomId: string) => {
    const room = rooms.find(item => item.id === roomId)
    if (!room) return

    setPopupRoomId(roomId)
    setRoomName(room.name)
    setRoomWidth(String(room.width))
    setRoomLength(String(room.length))
  }

  const resetActionStates = () => {
    setActionMessage(null)
    setActionError(null)
  }

  const validateRoomFields = () => {
    if (!roomName.trim()) {
      return 'Raumname ist erforderlich.'
    }
    if (!roomWidth.trim() || Number.isNaN(Number(roomWidth)) || Number(roomWidth) <= 0) {
      return 'Raumbreite muss eine positive Zahl sein.'
    }
    if (!roomLength.trim() || Number.isNaN(Number(roomLength)) || Number(roomLength) <= 0) {
      return 'Raumlänge muss eine positive Zahl sein.'
    }
    return null
  }

  const handleCreateRoom = async () => {
    resetActionStates()
    const validationError = validateRoomFields()
    if (validationError) {
      setActionError(validationError)
      return
    }

    setSaving(true)

    try {
      const createdRoom = await createRoom({
        name: roomName.trim(),
        width: Number(roomWidth),
        length: Number(roomLength),
      })

      const sortedRooms = await refreshRooms()
      setSelectedRoomId(createdRoom.id)
      setPopupRoomId(createdRoom.id)
      setActionMessage('Raum wurde erstellt.')
      const created = sortedRooms.find(room => room.id === createdRoom.id)
      if (created) {
        setRoomName(created.name)
        setRoomWidth(String(created.width))
        setRoomLength(String(created.length))
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateRoom = async () => {
    resetActionStates()
    if (!popupRoomId) {
      setActionError('Bitte wählen Sie einen Raum aus der Liste.')
      return
    }

    const validationError = validateRoomFields()
    if (validationError) {
      setActionError(validationError)
      return
    }

    setSaving(true)

    try {
      const updatedRoom = await updateRoom(popupRoomId, {
        name: roomName.trim(),
        width: Number(roomWidth),
        length: Number(roomLength),
      })

      const sortedRooms = await refreshRooms()
      setSelectedRoomId(updatedRoom.id)
      setPopupRoomId(updatedRoom.id)
      setActionMessage('Raum wurde aktualisiert.')
      const updated = sortedRooms.find(room => room.id === updatedRoom.id)
      if (updated) {
        setRoomName(updated.name)
        setRoomWidth(String(updated.width))
        setRoomLength(String(updated.length))
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRoom = async () => {
    resetActionStates()
    if (!popupRoomId) {
      setActionError('Bitte wählen Sie einen Raum aus der Liste.')
      return
    }

    setSaving(true)

    try {
      await deleteRoom(popupRoomId)
      const sortedRooms = await refreshRooms()
      const nextRoom = sortedRooms[0]
      if (nextRoom) {
        setSelectedRoomId(nextRoom.id)
        setPopupRoomId(nextRoom.id)
        setRoomName(nextRoom.name)
        setRoomWidth(String(nextRoom.width))
        setRoomLength(String(nextRoom.length))
      } else {
        setSelectedRoomId('')
        setPopupRoomId('')
        setRoomName('')
        setRoomWidth('')
        setRoomLength('')
      }
      setActionMessage('Raum wurde gelöscht.')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

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
                <button type="button" className="top-button" onClick={() => setShowRoomModal(true)}>
                  Raum
                </button>
                <button type="button" className="top-button">Möbeltyp</button>
                <button type="button" className="top-button">Möbel</button>
              </div>
            ) : null}
          </div>

          {roomError ? <p className="dashboard-error">Fehler beim Laden der Räume: {roomError}</p> : null}
        </section>

        <section className="dashboard-main">
          <div className="dashboard-card">
            <h1>Raumplaner Frontend</h1>
            <div className="dashboard-note">
              <strong>Hinweis:</strong> Diese Login-Maske ist nur für die Entwicklung. Microsoft Login wird später integriert.
            </div>
          </div>
        </section>
      </main>

      {showRoomModal ? (
        <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="room-modal-title">
          <div className="room-modal">
            <div className="room-modal-header">
              <h2 id="room-modal-title">Raumverwaltung</h2>
              <button type="button" className="modal-close" onClick={() => setShowRoomModal(false)}>
                ×
              </button>
            </div>

            <div className="room-modal-content">
              <div className="room-list-panel">
                <h3>Räume</h3>
                <ul className="room-list" role="listbox" aria-label="Räume">
                  {rooms.map(room => (
                    <li
                      key={room.id}
                      className={room.id === popupRoomId ? 'room-list-item selected' : 'room-list-item'}
                      onClick={() => handlePopupRoomSelect(room.id)}
                      role="option"
                      aria-selected={room.id === popupRoomId}
                    >
                      {room.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="room-form-panel">
                <label className="field-label">
                  Raumname
                  <input value={roomName} onChange={event => setRoomName(event.target.value)} />
                </label>

                <div className="room-dimensions">
                  <label className="field-label">
                    Raumbreite
                    <input value={roomWidth} onChange={event => setRoomWidth(event.target.value)} />
                  </label>
                  <label className="field-label">
                    Raumlänge
                    <input value={roomLength} onChange={event => setRoomLength(event.target.value)} />
                  </label>
                </div>

                <div className="room-actions">
                  <button type="button" className="action-button" onClick={handleCreateRoom} disabled={saving}>
                    Neuen Raum erstellen
                  </button>
                  <button type="button" className="action-button" onClick={handleUpdateRoom} disabled={saving}>
                    Update Raum
                  </button>
                  <button type="button" className="action-button danger" onClick={handleDeleteRoom} disabled={saving}>
                    Raum löschen
                  </button>
                </div>

                {actionMessage ? <p className="room-success">{actionMessage}</p> : null}
                {actionError ? <p className="room-error">{actionError}</p> : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default DashboardPage
