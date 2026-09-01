import { useRef, type ChangeEvent } from 'react'
import { useMapStore } from '../state/mapStore'
import { useViewportStore } from '../state/viewportStore'

const MENU_ITEMS = ['Project', 'Map', 'View', 'Export', 'Settings'] as const
type MenuItem = (typeof MENU_ITEMS)[number]

export function TopBar() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const loadFromFile = useMapStore((s) => s.loadFromFile)
  const requestReset = useViewportStore((s) => s.requestReset)

  const handleMenuClick = (item: MenuItem) => {
    if (item === 'Map') {
      fileInputRef.current?.click()
    } else if (item === 'View') {
      requestReset()
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
