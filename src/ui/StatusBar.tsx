import { useViewportStore } from '../state/viewportStore'

export function StatusBar() {
  const scale = useViewportStore((s) => s.scale)

  return (
    <div className="statusbar">
      <span>Zoom {Math.round(scale * 100)}%</span>
      <span>Scale not configured</span>
    </div>
  )
}
