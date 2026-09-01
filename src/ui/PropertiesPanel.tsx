import { clampFocalLength, getCompatibleLenses } from '../data/compatibility'
import { useCameraDefinitions } from '../data/cameraCatalog'
import { useLensDefinitions } from '../data/lensCatalog'
import { resolveCameraDepthOfField } from '../data/resolveDepthOfField'
import { resolveCameraFov } from '../data/resolveFov'
import { distanceMeters } from '../geometry/distance'
import { useCameraStore } from '../state/cameraStore'
import { useDrawingStore } from '../state/drawingStore'
import { useHistoryStore } from '../state/historyStore'
import { useScaleStore } from '../state/scaleStore'
import { useSelectionStore } from '../state/selectionStore'
import { useSubjectStore } from '../state/subjectStore'
import type { SubjectType } from '../types/subject'

const DEFAULT_FOCUS_DISTANCE_M = 3
const MAX_APERTURE_FSTOP = 22

function DistanceList({
  from,
  targets,
}: {
  from: { x: number; y: number }
  targets: { id: string; name: string; x: number; y: number }[]
}) {
  const pixelsPerMeter = useScaleStore((s) => s.pixelsPerMeter)

  if (targets.length === 0) return null

  return (
    <>
      <p className="properties__title">Distance</p>
      {targets.map((target) => {
        const meters = distanceMeters(from, target, pixelsPerMeter)
        return (
          <div className="properties__row" key={target.id}>
            <label>{target.name}</label>
            <span>{meters !== null ? `${meters.toFixed(2)} m` : 'Scale not configured'}</span>
          </div>
        )
      })}
    </>
  )
}

function CameraProperties({ cameraId }: { cameraId: string }) {
  const camera = useCameraStore((s) => s.cameras.find((c) => c.id === cameraId))
  const updateCamera = useCameraStore((s) => s.updateCamera)
  const subjects = useSubjectStore((s) => s.subjects)
  const cameraDefinitions = useCameraDefinitions()
  const lensDefinitions = useLensDefinitions()

  if (!camera) return null

  const cameraDefinition = cameraDefinitions.find((c) => c.id === camera.cameraDefinitionId)
  const lensDefinition = lensDefinitions.find((l) => l.id === camera.lensDefinitionId)
  const fov = resolveCameraFov(camera)
  const dof = resolveCameraDepthOfField(camera)
  const compatibleLenses = cameraDefinition
    ? getCompatibleLenses(cameraDefinition, lensDefinitions)
    : []

  const handleCameraChange = (id: string) => {
    const next = cameraDefinitions.find((c) => c.id === id) ?? null
    // Changing the camera model can invalidate the current lens (different mount),
    // so the lens selection is cleared and must be re-chosen from the compatible list.
    useHistoryStore.getState().commit()
    updateCamera(camera.id, {
      cameraDefinitionId: next?.id ?? null,
      lensDefinitionId: null,
      focalLengthMm: null,
    })
  }

  const handleLensChange = (id: string) => {
    const next = lensDefinitions.find((l) => l.id === id) ?? null
    useHistoryStore.getState().commit()
    updateCamera(camera.id, {
      lensDefinitionId: next?.id ?? null,
      focalLengthMm: next ? clampFocalLength(next, next.type === 'prime' ? next.focalLengthMm : next.focalMinMm) : null,
      apertureFStop: next?.maxAperture ?? null,
      focusDistanceM: next ? (camera.focusDistanceM ?? DEFAULT_FOCUS_DISTANCE_M) : null,
    })
  }

  const handleFocalLengthChange = (value: number) => {
    if (!lensDefinition || !Number.isFinite(value)) return
    updateCamera(camera.id, { focalLengthMm: clampFocalLength(lensDefinition, value) })
  }

  const handleApertureChange = (value: number) => {
    if (!lensDefinition || !Number.isFinite(value)) return
    const clamped = Math.max(lensDefinition.maxAperture, Math.min(MAX_APERTURE_FSTOP, value))
    updateCamera(camera.id, { apertureFStop: clamped })
  }

  const handleFocusDistanceChange = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) return
    updateCamera(camera.id, { focusDistanceM: value })
  }

  return (
    <>
      <p className="properties__title">Camera</p>

      <div className="properties__row">
        <label htmlFor="camera-name">Name</label>
        <input
          id="camera-name"
          type="text"
          value={camera.name}
          onFocus={() => useHistoryStore.getState().commit()}
          onChange={(e) => updateCamera(camera.id, { name: e.target.value })}
        />
      </div>

      <div className="properties__row">
        <label htmlFor="camera-model">Camera</label>
        <select
          id="camera-model"
          value={camera.cameraDefinitionId ?? ''}
          onChange={(e) => handleCameraChange(e.target.value)}
        >
          <option value="">Select camera…</option>
          {cameraDefinitions.map((def) => (
            <option key={def.id} value={def.id}>
              {def.manufacturer} {def.model}
            </option>
          ))}
        </select>
      </div>

      <div className="properties__row">
        <label htmlFor="camera-lens">Lens</label>
        <select
          id="camera-lens"
          value={camera.lensDefinitionId ?? ''}
          disabled={!cameraDefinition}
          onChange={(e) => handleLensChange(e.target.value)}
        >
          <option value="">Select lens…</option>
          {compatibleLenses.map((def) => (
            <option key={def.id} value={def.id}>
              {def.manufacturer} {def.name}
            </option>
          ))}
        </select>
      </div>

      <div className="properties__row">
        <label>Focal Length</label>
        {lensDefinition?.type === 'zoom' ? (
          <div className="properties__focal-control">
            <input
              type="range"
              min={lensDefinition.focalMinMm}
              max={lensDefinition.focalMaxMm}
              step={1}
              value={camera.focalLengthMm ?? lensDefinition.focalMinMm}
              onFocus={() => useHistoryStore.getState().commit()}
              onChange={(e) => handleFocalLengthChange(Number(e.target.value))}
            />
            <input
              type="number"
              min={lensDefinition.focalMinMm}
              max={lensDefinition.focalMaxMm}
              value={Math.round(camera.focalLengthMm ?? lensDefinition.focalMinMm)}
              onFocus={() => useHistoryStore.getState().commit()}
              onChange={(e) => handleFocalLengthChange(Number(e.target.value))}
            />
            <span>mm</span>
          </div>
        ) : (
          <span>{lensDefinition ? `${lensDefinition.focalLengthMm} mm (fixed)` : 'Not set'}</span>
        )}
      </div>

      <div className="properties__row">
        <label>Position X</label>
        <span>{Math.round(camera.x)} px</span>
      </div>

      <div className="properties__row">
        <label>Position Y</label>
        <span>{Math.round(camera.y)} px</span>
      </div>

      <div className="properties__row">
        <label htmlFor="camera-rotation">Rotation</label>
        <input
          id="camera-rotation"
          type="number"
          step="1"
          value={Math.round(camera.rotationDeg)}
          onFocus={() => useHistoryStore.getState().commit()}
          onChange={(e) => {
            const value = Number(e.target.value)
            if (Number.isFinite(value)) updateCamera(camera.id, { rotationDeg: value })
          }}
        />
      </div>

      <div className="properties__row">
        <label>HFOV</label>
        <span>{fov ? `${fov.horizontalDeg.toFixed(1)}°` : 'Not set'}</span>
      </div>

      <div className="properties__row">
        <label>VFOV</label>
        <span>{fov ? `${fov.verticalDeg.toFixed(1)}°` : 'Not set'}</span>
      </div>

      <div className="properties__row">
        <label htmlFor="camera-aperture">Aperture (f/)</label>
        <input
          id="camera-aperture"
          type="number"
          step="0.1"
          min={lensDefinition?.maxAperture ?? 0}
          max={MAX_APERTURE_FSTOP}
          disabled={!lensDefinition}
          value={camera.apertureFStop ?? ''}
          onFocus={() => useHistoryStore.getState().commit()}
          onChange={(e) => handleApertureChange(Number(e.target.value))}
        />
      </div>

      <div className="properties__row">
        <label htmlFor="camera-focus-distance">Focus Distance (m)</label>
        <input
          id="camera-focus-distance"
          type="number"
          step="0.1"
          min={0.1}
          disabled={!lensDefinition}
          value={camera.focusDistanceM ?? ''}
          onFocus={() => useHistoryStore.getState().commit()}
          onChange={(e) => handleFocusDistanceChange(Number(e.target.value))}
        />
      </div>

      <div className="properties__row">
        <label>Near / Far Focus</label>
        <span>
          {dof
            ? `${dof.nearM.toFixed(2)}m – ${dof.farM !== null ? `${dof.farM.toFixed(2)}m` : '∞'}`
            : 'Not set'}
        </span>
      </div>

      <div className="properties__row">
        <label>Hyperfocal</label>
        <span>{dof ? `${dof.hyperfocalM.toFixed(2)} m` : 'Not set'}</span>
      </div>

      <DistanceList from={camera} targets={subjects} />
    </>
  )
}

function SubjectProperties({ subjectId }: { subjectId: string }) {
  const subject = useSubjectStore((s) => s.subjects.find((sub) => sub.id === subjectId))
  const updateSubject = useSubjectStore((s) => s.updateSubject)
  const cameras = useCameraStore((s) => s.cameras)

  if (!subject) return null

  return (
    <>
      <p className="properties__title">Subject</p>

      <div className="properties__row">
        <label htmlFor="subject-name">Name</label>
        <input
          id="subject-name"
          type="text"
          value={subject.name}
          onFocus={() => useHistoryStore.getState().commit()}
          onChange={(e) => updateSubject(subject.id, { name: e.target.value })}
        />
      </div>

      <div className="properties__row">
        <label htmlFor="subject-type">Type</label>
        <select
          id="subject-type"
          value={subject.type}
          onChange={(e) => {
            useHistoryStore.getState().commit()
            updateSubject(subject.id, { type: e.target.value as SubjectType })
          }}
        >
          <option value="person">Person</option>
          <option value="object">Object</option>
        </select>
      </div>

      <div className="properties__row">
        <label>Position X</label>
        <span>{Math.round(subject.x)} px</span>
      </div>

      <div className="properties__row">
        <label>Position Y</label>
        <span>{Math.round(subject.y)} px</span>
      </div>

      <div className="properties__row">
        <label htmlFor="subject-rotation">Rotation</label>
        <input
          id="subject-rotation"
          type="number"
          step="1"
          value={Math.round(subject.rotationDeg)}
          onFocus={() => useHistoryStore.getState().commit()}
          onChange={(e) => {
            const value = Number(e.target.value)
            if (Number.isFinite(value)) updateSubject(subject.id, { rotationDeg: value })
          }}
        />
      </div>

      {subject.type === 'person' && (
        <div className="properties__row">
          <label htmlFor="subject-personal-space">Personal Space</label>
          <input
            id="subject-personal-space"
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={subject.personalSpaceRadiusM ?? 0}
            onFocus={() => useHistoryStore.getState().commit()}
            onChange={(e) => {
              const value = Number(e.target.value)
              if (Number.isFinite(value)) {
                updateSubject(subject.id, { personalSpaceRadiusM: Math.max(0, Math.min(5, value)) })
              }
            }}
          />
        </div>
      )}

      <DistanceList from={subject} targets={cameras} />
    </>
  )
}

function DrawingProperties({ drawingId }: { drawingId: string }) {
  const drawing = useDrawingStore((s) => s.drawings.find((d) => d.id === drawingId))
  const removeDrawing = useDrawingStore((s) => s.removeDrawing)
  const select = useSelectionStore((s) => s.select)

  if (!drawing) return null

  return (
    <>
      <p className="properties__title">Drawing</p>

      <div className="properties__row">
        <label>Type</label>
        <span>{drawing.type}</span>
      </div>

      <div className="properties__row">
        <label>Color</label>
        <span>{drawing.color}</span>
      </div>

      <button
        type="button"
        onClick={() => {
          useHistoryStore.getState().commit()
          removeDrawing(drawing.id)
          select(null)
        }}
      >
        Delete
      </button>
    </>
  )
}

export function PropertiesPanel() {
  const selected = useSelectionStore((s) => s.selected)

  return (
    <div className="panel properties">
      {selected?.kind === 'camera' && <CameraProperties cameraId={selected.id} />}
      {selected?.kind === 'subject' && <SubjectProperties subjectId={selected.id} />}
      {selected?.kind === 'drawing' && <DrawingProperties drawingId={selected.id} />}
      {!selected && (
        <>
          <p className="properties__title">Properties</p>
          <p className="properties__empty">No object selected.</p>
        </>
      )}
    </div>
  )
}
