import { useRef, type ChangeEvent } from 'react'
import { useExportUiStore } from '../state/exportUiStore'
import { useHistoryStore } from '../state/historyStore'
import { useMapStore } from '../state/mapStore'
import { useViewportStore } from '../state/viewportStore'

const MENU_ITEMS = ['Project', 'Map', 'View', 'Export', 'Settings'] as const
type MenuItem = (typeof MENU_ITEMS)[number]

export function TopBar() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const loadFromFile = useMapStore((s) => s.loadFromFile)
  const requestReset = useViewportStore((s) => s.requestReset)
  const canUndo = useHistoryStore((s) => s.past.length > 0)
  const canRedo = useHistoryStore((s) => s.future.length > 0)
  const undo = useHistoryStore((s) => s.undo)
  const redo = useHistoryStore((s) => s.redo)
  const openExport = useExportUiStore((s) => s.open)

  const handleMenuClick = (item: MenuItem) => {
    if (item === 'Map') {
      fileInputRef.current?.click()
    } else if (item === 'View') {
      requestReset()
    } else if (item === 'Export') {
      openExport()
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadFromFile(file)
    e.target.value = ''
  }

  return (
    <div className="topbar">
      <span className="topbar__brand">Camera Plan</span>
      <nav className="topbar__menu">
        {MENU_ITEMS.map((item) => (
          <button
            key={item}
            className="topbar__menu-item"
            type="button"
            onClick={() => handleMenuClick(item)}
          >
            {item}
          </button>
        ))}
      </nav>
      <div className="topbar__history">
        <button
          type="button"
          title="Undo (Ctrl+Z)"
          disabled={!canUndo}
          onClick={() => undo()}
        >
          ↶
        </button>
        <button
          type="button"
          title="Redo (Ctrl+Shift+Z)"
          disabled={!canRedo}
          onClick={() => redo()}
        >
          ↷
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  )
}
