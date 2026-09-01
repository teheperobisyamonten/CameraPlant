import { useState, type FormEvent } from 'react'
import { useScaleStore } from '../../state/scaleStore'

export function ScaleCalibrationPanel() {
  const isCalibrating = useScaleStore((s) => s.isCalibrating)
  const pointA = useScaleStore((s) => s.pointA)
  const pointB = useScaleStore((s) => s.pointB)
  const error = useScaleStore((s) => s.error)
  const confirmRealDistance = useScaleStore((s) => s.confirmRealDistance)
  const cancelCalibration = useScaleStore((s) => s.cancelCalibration)
  const [distanceInput, setDistanceInput] = useState('')

  if (!isCalibrating) return null

  if (!pointA) {
    return (
      <div className="canvas-area__hint">
        <span>Click Point A on the map to start scale calibration.</span>
        <button type="button" onClick={cancelCalibration}>
          Cancel
        </button>
      </div>
    )
  }

  if (!pointB) {
    return (
      <div className="canvas-area__hint">
        <span>Click Point B on the map.</span>
        <button type="button" onClick={cancelCalibration}>
          Cancel
        </button>
      </div>
    )
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    confirmRealDistance(Number(distanceInput))
  }

  return (
    <form className="canvas-area__hint canvas-area__hint--form" onSubmit={handleSubmit}>
      <label>
        Real Distance (m)
        <input
          type="number"
          min="0"
          step="0.01"
          value={distanceInput}
          onChange={(e) => setDistanceInput(e.target.value)}
          autoFocus
        />
      </label>
      {error && <span className="canvas-area__hint-error">{error}</span>}
      <div className="canvas-area__hint-actions">
        <button type="submit">Confirm</button>
        <button type="button" onClick={cancelCalibration}>
          Cancel
        </button>
      </div>
    </form>
  )
}
