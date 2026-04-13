import React from 'react'

export type CrudAction = {
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
}

export type CrudItem = {
  id: string
  label: string
}

interface CrudModalProps {
  title: string
  open: boolean
  onClose: () => void
  listTitle: string
  items: CrudItem[]
  selectedId: string
  onSelect: (id: string) => void
  actions: CrudAction[]
  status?: { message?: string; error?: string }
  children: React.ReactNode
}

const CrudModal = ({
  title,
  open,
  onClose,
  listTitle,
  items,
  selectedId,
  onSelect,
  actions,
  status,
  children,
}: CrudModalProps) => {
  if (!open) {
    return null
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="crud-modal-title">
      <div className="crud-modal">
        <div className="crud-modal-header">
          <h2 id="crud-modal-title">{title}</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="crud-modal-content">
          <div className="crud-list-panel">
            <h3>{listTitle}</h3>
            <ul className="crud-list" role="listbox" aria-label={listTitle}>
              {items.map(item => (
                <li
                  key={item.id}
                  className={item.id === selectedId ? 'crud-list-item selected' : 'crud-list-item'}
                  onClick={() => onSelect(item.id)}
                  role="option"
                  aria-selected={item.id === selectedId}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="crud-form-panel">
            {children}

            <div className="crud-actions">
              {actions.map(action => (
                <button
                  key={action.label}
                  type="button"
                  className={action.variant === 'danger' ? 'action-button danger' : 'action-button'}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {action.label}
                </button>
              ))}
            </div>

            {status?.message ? <p className="room-success">{status.message}</p> : null}
            {status?.error ? <p className="room-error">{status.error}</p> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CrudModal
