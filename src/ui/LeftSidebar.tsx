import { useCameraStore } from '../state/cameraStore'
import { useHistoryStore } from '../state/historyStore'
import { LayersPanel } from './LayersPanel'
import { useMapStore } from '../state/mapStore'
import { useProjectStore } from '../state/projectStore'
import { useScaleStore } from '../state/scaleStore'
import { useSelectionStore } from '../state/selectionStore'
import { SEQUENCE_COUNT, useSequenceStore } from '../state/sequenceStore'
import { useSubjectStore } from '../state/subjectStore'
import { useToolStore, type ToolMode } from '../state/toolStore'

const TOOL_ITEMS: { mode: ToolMode; label: string }[] = [
  { mode: 'pen', label: 'Pen' },
  { mode: 'line', label: 'Line' },
  { mode: 'arrow', label: 'Arrow' },
  { mode: 'rectangle', label: 'Rectangle' },
  { mode: 'circle', label: 'Circle' },
  { mode: 'text', label: 'Text' },
  { mode: 'eraser', label: 'Eraser' },
  { mode: 'measure', label: 'Measure' },
]

/** Spread newly placed cameras out a little so they don't stack exactly on top of each other. */
const PLACEMENT_STAGGER_PX = 24
const PLACEMENT_STAGGER_COUNT = 6

/** MIME type used for the HTML5 drag payload identifying which object kind is being dropped. */
export const DRAG_OBJECT_KIND_MIME = 'application/x-camera-plant-object'

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="14" height="12" rx="2" fill="#2d2d30" stroke="#8a8a8a" />
      <rect x="15" y="10" width="6" height="4" rx="1" fill="#4fc3f7" />
      <circle cx="8" cy="13" r="3" fill="#4fc3f7" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="7" r="4" fill="#e0a458" stroke="#8a8a8a" />
      <rect x="7" y="12" width="10" height="9" rx="3" fill="#e0a458" stroke="#8a8a8a" />
    </svg>
  )
}

export function LeftSidebar() {
  const projectName = useProjectStore((s) => s.name)
  const setProjectName = useProjectStore((s) => s.setName)
  const image = useMapStore((s) => s.image)
  const pixelsPerMeter = useScaleStore((s) => s.pixelsPerMeter)
  const isCalibrating = useScaleStore((s) => s.isCalibrating)
  const startCalibration = useScaleStore((s) => s.startCalibration)
  const setPixelsPerMeter = useScaleStore((s) => s.setPixelsPerMeter)
  const scaleError = useScaleStore((s) => s.error)

  const cameras = useCameraStore((s) => s.cameras)
  const addCamera = useCameraStore((s) => s.addCamera)
  const subjects = useSubjectStore((s) => s.subjects)
  const addSubject = useSubjectStore((s) => s.addSubject)
  const select = useSelectionStore((s) => s.select)

  const activeSequenceIndex = useSequenceStore((s) => s.activeIndex)
  const switchSequence = useSequenceStore((s) => s.switchTo)
  const duplicateSequence = useSequenceStore((s) => s.duplicateCurrentToNext)
  const clearSequence = useSequenceStore((s) => s.clearCurrent)

  const activeTool = useToolStore((s) => s.activeTool)
  const setActiveTool = useToolStore((s) => s.setActiveTool)
  const toolColor = useToolStore((s) => s.color)
  const setToolColor = useToolStore((s) => s.setColor)
  const toolStrokeWidth = useToolStore((s) => s.strokeWidth)
  const setToolStrokeWidth = useToolStore((s) => s.setStrokeWidth)

  const handleToolClick = (mode: ToolMode) => {
    setActiveTool(activeTool === mode ? 'select' : mode)
  }

  const handleAddCamera = () => {
    if (!image) return
    const stagger = (cameras.length % PLACEMENT_STAGGER_COUNT) * PLACEMENT_STAGGER_PX
    useHistoryStore.getState().commit()
    const id = addCamera({ x: image.width / 2 + stagger, y: image.height / 2 + stagger })
    select({ kind: 'camera', id })
  }

  const handleAddSubject = () => {
    if (!image) return
    const stagger = (subjects.length % PLACEMENT_STAGGER_COUNT) * PLACEMENT_STAGGER_PX
    useHistoryStore.getState().commit()
    const id = addSubject({ x: image.width / 2 - stagger, y: image.height / 2 + stagger })
    select({ kind: 'subject', id })
  }

  return (
    <div className="panel sidebar">
      <div className="sidebar__section">
        <p className="sidebar__section-title">Project</p>
        <div className="sidebar__list">
          <input
            className="sidebar__project-name"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>
      </div>

      <div className="sidebar__section">
        <p className="sidebar__section-title">Sequence</p>
        <div className="sequence__grid">
          {Array.from({ length: SEQUENCE_COUNT }, (_, i) => (
            <button
              key={i}
              type="button"
              className="sequence__item"
              aria-pressed={i === activeSequenceIndex}
              onClick={() => switchSequence(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="sequence__actions">
          <button
            type="button"
            className="sidebar__item sequence__duplicate"
            disabled={activeSequenceIndex >= SEQUENCE_COUNT - 1}
            onClick={duplicateSequence}
          >
            Duplicate
          </button>
          <button type="button" className="sidebar__item sequence__clear" onClick={clearSequence}>
            Clear
          </button>
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
          <div className="scale__manual-row">
            <span>1 m =</span>
            <input
              type="number"
              min={0}
              step="0.1"
              placeholder="e.g. 161"
              value={pixelsPerMeter ? Math.round(pixelsPerMeter * 100) / 100 : ''}
              onChange={(e) => {
                const value = Number(e.target.value)
                if (e.target.value !== '' && Number.isFinite(value)) setPixelsPerMeter(value)
              }}
            />
            <span>px</span>
          </div>
          {scaleError && <span className="canvas-area__hint-error">{scaleError}</span>}
          {!pixelsPerMeter && !scaleError && (
            <span className="properties__empty">Scale not configured</span>
          )}
        </div>
      </div>

      <div className="sidebar__section">
        <p className="sidebar__section-title">Objects</p>
        <div className="sidebar__icon-list">
          <button
            className="sidebar__icon-btn"
            type="button"
            disabled={!image}
            draggable={!!image}
            onDragStart={(e) => {
              e.dataTransfer.setData(DRAG_OBJECT_KIND_MIME, 'camera')
              e.dataTransfer.effectAllowed = 'copy'
            }}
            onClick={handleAddCamera}
            title="Drag onto the map to place, or click to add"
          >
            <CameraIcon />
            <span>Camera</span>
          </button>
          <button
            className="sidebar__icon-btn"
            type="button"
            disabled={!image}
            draggable={!!image}
            onDragStart={(e) => {
              e.dataTransfer.setData(DRAG_OBJECT_KIND_MIME, 'subject')
              e.dataTransfer.effectAllowed = 'copy'
            }}
            onClick={handleAddSubject}
            title="Drag onto the map to place, or click to add"
          >
            <PersonIcon />
            <span>Subject</span>
          </button>
        </div>
      </div>

      <LayersPanel />

      <div className="sidebar__section">
        <p className="sidebar__section-title">Tools</p>
        <div className="tools__grid">
          {TOOL_ITEMS.map(({ mode, label }) => (
            <button
              key={mode}
              type="button"
              className="sidebar__item tools__item"
              aria-pressed={activeTool === mode}
              disabled={!image}
              onClick={() => handleToolClick(mode)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="tools__style-row">
          <label htmlFor="tool-color">Color</label>
          <input
            id="tool-color"
            type="color"
            value={toolColor}
            onChange={(e) => setToolColor(e.target.value)}
          />
          <label htmlFor="tool-stroke-width">Width</label>
          <input
            id="tool-stroke-width"
            type="number"
            min={1}
            max={20}
            value={toolStrokeWidth}
            onChange={(e) => {
              const value = Number(e.target.value)
              if (Number.isFinite(value) && value > 0) setToolStrokeWidth(value)
            }}
          />
        </div>
      </div>
    </div>
  )
}
