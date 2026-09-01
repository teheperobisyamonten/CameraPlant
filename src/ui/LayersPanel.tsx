import { useMemo, useState } from 'react'
import { useCameraStore } from '../state/cameraStore'
import { useDrawingStore } from '../state/drawingStore'
import { useHistoryStore } from '../state/historyStore'
import { useSelectionStore } from '../state/selectionStore'
import { useSubjectStore } from '../state/subjectStore'
import type { SelectableKind } from '../state/selectionStore'

interface LayerRow {
  kind: SelectableKind
  id: string
  label: string
}

export function LayersPanel() {
  const cameras = useCameraStore((s) => s.cameras)
  const removeCamera = useCameraStore((s) => s.removeCamera)
  const subjects = useSubjectStore((s) => s.subjects)
  const removeSubject = useSubjectStore((s) => s.removeSubject)
  const drawings = useDrawingStore((s) => s.drawings)
  const removeDrawing = useDrawingStore((s) => s.removeDrawing)
  const selected = useSelectionStore((s) => s.selected)
  const select = useSelectionStore((s) => s.select)

  const [checked, setChecked] = useState<Set<string>>(new Set())

  const rows = useMemo<LayerRow[]>(
    () => [
      ...cameras.map((c) => ({ kind: 'camera' as const, id: c.id, label: c.name })),
      ...subjects.map((s) => ({ kind: 'subject' as const, id: s.id, label: s.name })),
      ...drawings.map((d) => ({ kind: 'drawing' as const, id: d.id, label: `${d.type}` })),
    ],
    [cameras, subjects, drawings],
  )

  const toggleChecked = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDeleteSelected = () => {
    if (checked.size === 0) return
    useHistoryStore.getState().commit()
    for (const row of rows) {
      if (!checked.has(row.id)) continue
      if (row.kind === 'camera') removeCamera(row.id)
      else if (row.kind === 'subject') removeSubject(row.id)
      else removeDrawing(row.id)
    }
    if (selected && checked.has(selected.id)) select(null)
    setChecked(new Set())
  }

  if (rows.length === 0) {
    return (
      <div className="sidebar__section">
        <p className="sidebar__section-title">Layers</p>
        <p className="properties__empty">No objects yet.</p>
      </div>
    )
  }

  return (
    <div className="sidebar__section">
      <p className="sidebar__section-title">Layers</p>
      <div className="layers__list">
        {rows.map((row) => (
          <div className="layers__row" key={row.id}>
            <input
              type="checkbox"
              checked={checked.has(row.id)}
              onChange={() => toggleChecked(row.id)}
            />
            <button
              type="button"
              className={`layers__label${selected?.id === row.id ? ' layers__label--active' : ''}`}
              onClick={() => select({ kind: row.kind, id: row.id })}
            >
              <span className="layers__kind">{row.kind}</span>
              {row.label}
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="sidebar__item layers__delete"
        disabled={checked.size === 0}
        onClick={handleDeleteSelected}
      >
        Delete Selected ({checked.size})
      </button>
    </div>
  )
}
