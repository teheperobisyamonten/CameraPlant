import { useMapStore } from '../state/mapStore'
import { useScaleStore } from '../state/scaleStore'

export function LeftSidebar() {
  const image = useMapStore((s) => s.image)
  const pixelsPerMeter = useScaleStore((s) => s.pixelsPerMeter)
  const isCalibrating = useScaleStore((s) => s.isCalibrating)
  const startCalibration = useScaleStore((s) => s.startCalibration)

  return (
    <div className="panel sidebar">
      <div className="sidebar__section">
        <p className="sidebar__section-title">Project</p>
        <div className="sidebar__list">
          <button className="sidebar__item" type="button">
            Untitled Project
          </button>
        </div>
      </div>

      <div className="sidebar__section">
        <p className="sidebar__section-title">Sequence</p>
        <div className="sidebar__list">
          <span className="properties__empty">1 2 3 4 5 6 7 8 9 10</span>
        </div>
      </div>

      <div className="sidebar__section">
        <p className="sidebar__section-title">Scale</p>
        <div className="sidebar__list">
          <button
            className="sidebar__item"
            type="button"
            disabled={!image || isCalibrating}
            onClick={startCalibration}
          >
            {pixelsPerMeter ? 'Recalibrate Scale' : 'Set Scale'}
          </button>
          <span className="properties__empty">
            {pixelsPerMeter
              ? `1 m = ${Math.round(pixelsPerMeter)} px`
              : 'Scale not configured'}
          </span>
        </div>
      </div>

      <div className="sidebar__section">
        <p className="sidebar__section-title">Objects</p>
        <div className="sidebar__list">
          <button className="sidebar__item" type="button">
            Camera
          </button>
          <button className="sidebar__item" type="button">
            Subject
          </button>
        </div>
      </div>

      <div className="sidebar__section">
        <p className="sidebar__section-title">Tools</p>
        <div className="sidebar__list">
          <button className="sidebar__item" type="button">
            Pen
          </button>
          <button className="sidebar__item" type="button">
            Arrow
          </button>
          <button className="sidebar__item" type="button">
            Text
          </button>
          <button className="sidebar__item" type="button">
            Measure
          </button>
        </div>
      </div>
    </div>
  )
}
