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

export function LeftSidebar() {
  const projectName = useProjectStore((s) => s.name)
  const setProjectName = useProjectStore((s) => s.setName)
  const image = useMapStore((s) => s.image)
  const pixelsPerMeter = useScaleStore((s) => s.pixelsPerMeter)
  const isCalibrating = useScaleStore((s) => s.isCalibrating)
  const startCalibration = useScaleStore((s) => s.startCalibration)

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
