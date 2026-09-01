import { clampFocalLength, getCompatibleLenses } from '../data/compatibility'
import CAMERAS from '../data/cameras.json'
import LENSES from '../data/lenses.json'
import { resolveCameraFov } from '../data/resolveFov'
import { distanceMeters } from '../geometry/distance'
import { useCameraStore } from '../state/cameraStore'
import { useScaleStore } from '../state/scaleStore'
import { useSelectionStore } from '../state/selectionStore'
import { useSubjectStore } from '../state/subjectStore'
import type { CameraDefinition } from '../types/cameraDefinition'
import type { LensDefinition } from '../types/lensDefinition'
import type { SubjectType } from '../types/subject'

const CAMERA_DEFINITIONS = CAMERAS as CameraDefinition[]
const LENS_DEFINITIONS = LENSES as LensDefinition[]

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

  if (!camera) return null

  const cameraDefinition = CAMERA_DEFINITIONS.find((c) => c.id === camera.cameraDefinitionId)
  const lensDefinition = LENS_DEFINITIONS.find((l) => l.id === camera.lensDefinitionId)
  const fov = resolveCameraFov(camera)
  const compatibleLenses = cameraDefinition
    ? getCompatibleLenses(cameraDefinition, LENS_DEFINITIONS)
    : []

  const handleCameraChange = (id: string) => {
    const next = CAMERA_DEFINITIONS.find((c) => c.id === id) ?? null
    // Changing the camera model can invalidate the current lens (different mount),
    // so the lens selection is cleared and must be re-chosen from the compatible list.
    updateCamera(camera.id, {
      cameraDefinitionId: next?.id ?? null,
      lensDefinitionId: null,
      focalLengthMm: null,
    })
  }

  const handleLensChange = (id: string) => {
    const next = LENS_DEFINITIONS.find((l) => l.id === id) ?? null
    updateCamera(camera.id, {
      lensDefinitionId: next?.id ?? null,
      focalLengthMm: next ? clampFocalLength(next, next.type === 'prime' ? next.focalLengthMm : next.focalMinMm) : null,
    })
  }

  const handleFocalLengthChange = (value: number) => {
    if (!lensDefinition || !Number.isFinite(value)) return
    updateCamera(camera.id, { focalLengthMm: clampFocalLength(lensDefinition, value) })
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
          {CAMERA_DEFINITIONS.map((def) => (
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
              onChange={(e) => handleFocalLengthChange(Number(e.target.value))}
            />
            <input
              type="number"
              min={lensDefinition.focalMinMm}
              max={lensDefinition.focalMaxMm}
              value={Math.round(camera.focalLengthMm ?? lensDefinition.focalMinMm)}
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
          onChange={(e) => updateSubject(subject.id, { name: e.target.value })}
        />
      </div>

      <div className="properties__row">
        <label htmlFor="subject-type">Type</label>
        <select
          id="subject-type"
          value={subject.type}
          onChange={(e) => updateSubject(subject.id, { type: e.target.value as SubjectType })}
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
          onChange={(e) => {
            const value = Number(e.target.value)
            if (Number.isFinite(value)) updateSubject(subject.id, { rotationDeg: value })
          }}
        />
      </div>

      <DistanceList from={subject} targets={cameras} />
    </>
  )
}

export function PropertiesPanel() {
  const selected = useSelectionStore((s) => s.selected)

  return (
    <div className="panel properties">
      {selected?.kind === 'camera' && <CameraProperties cameraId={selected.id} />}
      {selected?.kind === 'subject' && <SubjectProperties subjectId={selected.id} />}
      {!selected && (
        <>
          <p className="properties__title">Properties</p>
          <p className="properties__empty">No object selected.</p>
        </>
      )}
    </div>
  )
}
