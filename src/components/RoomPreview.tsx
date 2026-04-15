import React from 'react'
import { Room, RoomObject } from '../types'

interface RoomPreviewProps {
  selectedRoom?: Room
  roomObjects: RoomObject[]
  selectedRoomObjectId: string
  selectedRoomObject?: RoomObject
  roomPreviewStyle?: React.CSSProperties
  getObjectPreviewPosition: (object: RoomObject) => { positionX: number; positionY: number }
  onStartDragObject: (object: RoomObject, event: React.PointerEvent<HTMLDivElement>) => void
  onMoveDraggedObject: (event: React.PointerEvent<HTMLDivElement>) => void
  onStopDragging: () => void
  saveFloorplan: () => void
  hasPreviewChanges: boolean
  saving: boolean
}

const RoomPreview = React.forwardRef<HTMLDivElement, RoomPreviewProps>(
  (
    {
      selectedRoom,
      roomObjects,
      selectedRoomObjectId,
      selectedRoomObject,
      roomPreviewStyle,
      getObjectPreviewPosition,
      onStartDragObject,
      onMoveDraggedObject,
      onStopDragging,
      saveFloorplan,
      hasPreviewChanges,
      saving,
    },
    ref,
  ) => {
    if (!selectedRoom) {
      return <p>Bitte wählen Sie einen Raum aus, um ihn als Fläche anzuzeigen.</p>
    }

    return (
      <div className="room-preview-grid">
        <div className="room-preview-region">
          <div
            ref={ref}
            className="room-preview__shape"
            style={roomPreviewStyle}
            onPointerMove={onMoveDraggedObject}
            onPointerUp={onStopDragging}
            onPointerCancel={onStopDragging}
          >
            {roomObjects
              .filter(object => object.roomId === selectedRoom.id)
              .map(object => {
                const previewPos = getObjectPreviewPosition(object)
                const objectStyle = {
                  width: `${object.width}px`,
                  height: `${object.length}px`,
                  left: `${previewPos.positionX}px`,
                  bottom: `${previewPos.positionY}px`,
                }

                return (
                  <div
                    key={object.id}
                    className={`room-object ${selectedRoomObjectId === object.id ? 'selected' : ''}`}
                    style={objectStyle}
                    onPointerDown={event => onStartDragObject(object, event)}
                    onPointerMove={onMoveDraggedObject}
                    onPointerUp={onStopDragging}
                    onPointerCancel={onStopDragging}
                  />
                )
              })}
          </div>
        </div>

        <div className="selected-object-details">
          {selectedRoomObject ? (
            <>
              <p>{selectedRoomObject.name || selectedRoomObject.objectTypeName}</p>
              <p>{selectedRoomObject.objectTypeName}</p>
            </>
          ) : (
            <p>Bitte ein Objekt im Raum auswählen, um Details anzuzeigen.</p>
          )}
        </div>

        <div className="room-info">
          <p>Breite: {selectedRoom.width} cm</p>
          <p>Länge: {selectedRoom.length} cm</p>
        </div>

        <div className="save-floorplan-row">
          <button
            type="button"
            className="top-button save-floorplan-button"
            onClick={saveFloorplan}
            disabled={saving || !hasPreviewChanges}
          >
            Raumplan speichern
          </button>
        </div>
      </div>
    )
  },
)

export default RoomPreview
