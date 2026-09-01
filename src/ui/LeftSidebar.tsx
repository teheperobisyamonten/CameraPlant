import { useCameraStore } from '../state/cameraStore'
import { useMapStore } from '../state/mapStore'
import { useScaleStore } from '../state/scaleStore'
import { useSelectionStore } from '../state/selectionStore'
import { useSubjectStore } from '../state/subjectStore'

/** Spread newly placed cameras out a little so they don't stack exactly on top of each other. */
const PLACEMENT_STAGGER_PX = 24
const PLACEMENT_STAGGER_COUNT = 6

export function LeftSidebar() {
  const image = useMapStore((s) => s.image)
  const pixelsPerMeter = useScaleStore((s) => s.pixelsPerMeter)
  const isCalibrating = useScaleStore((s) => s.isCalibrating)
  const startCalibration = useScaleStore((s) => s.startCalibration)

  const cameras = useCameraStore((s) => s.cameras)
  const addCamera = useCameraStore((s) => s.addCamera)
  const subjects = useSubjectStore((s) => s.subjects)
  const addSubject = useSubjectStore((s) => s.addSubject)
  const select = useSelectionStore((s) => s.select)

  const handleAddCamera = () => {
    if (!image) return
    const stagger = (cameras.length % PLACEMENT_STAGGER_COUNT) * PLACEMENT_STAGGER_PX
    const id = addCamera({ x: image.width / 2 + stagger, y: image.height / 2 + stagger })
    select({ kind: 'camera', id })
  }

  const handleAddSubject = () => {
    if (!image) return
    const stagger = (subjects.length % PLACEMENT_STAGGER_COUNT) * PLACEMENT_STAGGER_PX
    const id = addSubject({ x: image.width / 2 - stagger, y: image.height / 2 + stagger })
    select({ kind: 'subject', id })
  }

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
          <button
            className="sidebar__item"
            type="button"
            disabled={!image}
            onClick={handleAddCamera}
          >
            Camera
          </button>
          <button
            className="sidebar__item"
            type="button"
            disabled={!image}
            onClick={handleAddSubject}
          >
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
