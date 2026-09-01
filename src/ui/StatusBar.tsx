import { useScaleStore } from '../state/scaleStore'
import { useViewportStore } from '../state/viewportStore'

export function StatusBar() {
  const scale = useViewportStore((s) => s.scale)
  const pixelsPerMeter = useScaleStore((s) => s.pixelsPerMeter)

  return (
    <div className="statusbar">
      <span>Zoom {Math.round(scale * 100)}%</span>
      <span>
        {pixelsPerMeter ? `Scale 1m = ${Math.round(pixelsPerMeter)}px` : 'Scale not configured'}
      </span>
    </div>
  )
}
