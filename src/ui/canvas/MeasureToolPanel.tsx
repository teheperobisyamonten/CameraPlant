import { useState } from 'react'
import { distanceMeters } from '../../geometry/distance'
import type { Point } from '../../geometry/scale'
import { useScaleStore } from '../../state/scaleStore'

interface MeasureToolPanelProps {
  start: Point
  end: Point
  onSetScale: () => void
  onSaveOnly: () => void
  onCancel: () => void
}

/**
 * Shown after drawing a Measure line. Lets the user either just record the
 * measurement (using whatever Scale is already configured), or type the
 * real-world distance to recalibrate pixelsPerMeter for the whole project
 * from this one line — every FOV/DoF/Distance/Personal-Space readout that
 * already reads pixelsPerMeter picks up the new value automatically.
 */
export function MeasureToolPanel({ start, end, onSetScale, onSaveOnly, onCancel }: MeasureToolPanelProps) {
  const pixelsPerMeter = useScaleStore((s) => s.pixelsPerMeter)
  const error = useScaleStore((s) => s.error)
  const calibrateFromMeasurement = useScaleStore((s) => s.calibrateFromMeasurement)

  const [realDistance, setRealDistance] = useState('')

  const currentMeters = distanceMeters(start, end, pixelsPerMeter)

  const handleSetScale = () => {
    const meters = Number(realDistance)
    const ok = calibrateFromMeasurement(start, end, meters)
    if (ok) onSetScale()
  }

  return (
    <div className="canvas-area__hint canvas-area__hint--form">
      <span>
        {currentMeters !== null
          ? `Current scale: ${currentMeters.toFixed(2)} m`
          : 'Scale not configured yet'}
      </span>
      <label>
        Real Distance (m)
        <input
          type="number"
          min="0"
          step="0.01"
          value={realDistance}
          onChange={(e) => setRealDistance(e.target.value)}
          autoFocus
        />
      </label>
      {error && <span className="canvas-area__hint-error">{error}</span>}
      <div className="canvas-area__hint-actions">
        <button type="button" onClick={handleSetScale}>
          Set Scale
        </button>
        <button type="button" onClick={onSaveOnly}>
          Save Measurement
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
