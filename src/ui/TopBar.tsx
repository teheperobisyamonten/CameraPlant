const MENU_ITEMS = ['Project', 'Map', 'View', 'Export', 'Settings'] as const

export function TopBar() {
  return (
    <div className="topbar">
      <span className="topbar__brand">Camera Plan</span>
      <nav className="topbar__menu">
        {MENU_ITEMS.map((item) => (
          <button key={item} className="topbar__menu-item" type="button">
            {item}
          </button>
        ))}
      </nav>
    </div>
  )
}
