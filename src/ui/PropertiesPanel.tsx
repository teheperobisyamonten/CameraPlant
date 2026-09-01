import { clampFocalLength, getCompatibleLenses } from '../data/compatibility'
import CAMERAS from '../data/cameras.json'
import LENSES from '../data/lenses.json'
import { useCameraStore } from '../state/cameraStore'
import { useSelectionStore } from '../state/selectionStore'
import type { CameraDefinition } from '../types/cameraDefinition'
import type { LensDefinition } from '../types/lensDefinition'

const CAMERA_DEFINITIONS = CAMERAS as CameraDefinition[]
const LENS_DEFINITIONS = LENSES as LensDefinition[]

function CameraProperties({ cameraId }: { cameraId: string }) {
  const camera = useCameraStore((s) => s.cameras.find((c) => c.id === cameraId))
  const updateCamera = useCameraStore((s) => s.updateCamera)

  if (!camera) return null

  const cameraDefinition = CAMERA_DEFINITIONS.find((c) => c.id === camera.cameraDefinitionId)
  const lensDefinition = LENS_DEFINITIONS.find((l) => l.id === camera.lensDefinitionId)
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
    </>
  )
}

export function PropertiesPanel() {
  const selected = useSelectionStore((s) => s.selected)

  return (
    <div className="panel properties">
      {selected?.kind === 'camera' ? (
        <CameraProperties cameraId={selected.id} />
      ) : (
        <>
          <p className="properties__title">Properties</p>
          <p className="properties__empty">No object selected.</p>
        </>
      )}
    </div>
  )
}
