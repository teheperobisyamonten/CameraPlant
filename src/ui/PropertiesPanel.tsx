import { useCameraStore } from '../state/cameraStore'
import { useSelectionStore } from '../state/selectionStore'

function CameraProperties({ cameraId }: { cameraId: string }) {
  const camera = useCameraStore((s) => s.cameras.find((c) => c.id === cameraId))
  const updateCamera = useCameraStore((s) => s.updateCamera)

  if (!camera) return null

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
        <label>Camera</label>
        <span>Not set</span>
      </div>

      <div className="properties__row">
        <label>Lens</label>
        <span>Not set</span>
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
