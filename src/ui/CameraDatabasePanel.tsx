import { useState } from 'react'
import { BUILTIN_CAMERA_DEFINITIONS } from '../data/cameraCatalog'
import { deleteCustomCamera, saveCustomCamera } from '../persistence/customCameraPersistence'
import { useCameraDatabaseUiStore } from '../state/cameraDatabaseUiStore'
import { useCustomCameraStore } from '../state/customCameraStore'
import type { CameraDefinition } from '../types/cameraDefinition'

const EMPTY_FORM = {
  manufacturer: '',
  model: '',
  mount: '',
  sensorType: '',
  sensorWidthMm: '',
  sensorHeightMm: '',
}

export function CameraDatabasePanel() {
  const isOpen = useCameraDatabaseUiStore((s) => s.isOpen)
  const close = useCameraDatabaseUiStore((s) => s.close)
  const customCameras = useCustomCameraStore((s) => s.customCameras)
  const addCustomCamera = useCustomCameraStore((s) => s.addCustomCamera)
  const removeCustomCamera = useCustomCameraStore((s) => s.removeCustomCamera)

  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleAdd = () => {
    const manufacturer = form.manufacturer.trim()
    const model = form.model.trim()
    const mount = form.mount.trim()
    const sensorType = form.sensorType.trim()
    const sensorWidthMm = Number(form.sensorWidthMm)
    const sensorHeightMm = Number(form.sensorHeightMm)

    if (!manufacturer || !model || !mount) {
      setError('Manufacturer, Model, and Mount are required.')
      return
    }
    if (!Number.isFinite(sensorWidthMm) || sensorWidthMm <= 0 || !Number.isFinite(sensorHeightMm) || sensorHeightMm <= 0) {
      setError('Sensor Width/Height must be positive numbers.')
      return
    }

    const camera: CameraDefinition = {
      id: crypto.randomUUID(),
      manufacturer,
      model,
      mount,
      sensorType: sensorType || 'Custom',
      sensorWidthMm,
      sensorHeightMm,
    }

    addCustomCamera(camera)
    void saveCustomCamera(camera)
    setForm(EMPTY_FORM)
    setError(null)
  }

  const handleRemove = (id: string) => {
    removeCustomCamera(id)
    void deleteCustomCamera(id)
  }

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal camera-db-modal" onClick={(e) => e.stopPropagation()}>
        <p className="properties__title">Camera Database</p>

        <p className="sidebar__section-title">Built-in</p>
        <div className="camera-db__list">
          {BUILTIN_CAMERA_DEFINITIONS.map((cam) => (
            <div className="camera-db__row" key={cam.id}>
              <span>
                {cam.manufacturer} {cam.model}
              </span>
              <span className="properties__empty">
                {cam.mount} · {cam.sensorWidthMm}×{cam.sensorHeightMm}mm
              </span>
            </div>
          ))}
        </div>

        <p className="sidebar__section-title">Custom</p>
        {customCameras.length === 0 && <p className="properties__empty">No custom cameras yet.</p>}
        <div className="camera-db__list">
          {customCameras.map((cam) => (
            <div className="camera-db__row" key={cam.id}>
              <span>
                {cam.manufacturer} {cam.model}
              </span>
              <span className="properties__empty">
                {cam.mount} · {cam.sensorWidthMm}×{cam.sensorHeightMm}mm
              </span>
              <button type="button" onClick={() => handleRemove(cam.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>

        <p className="sidebar__section-title">Add Custom Camera</p>
        <div className="properties__row">
          <label htmlFor="cam-db-manufacturer">Manufacturer</label>
          <input
            id="cam-db-manufacturer"
            type="text"
            value={form.manufacturer}
            onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))}
          />
        </div>
        <div className="properties__row">
          <label htmlFor="cam-db-model">Model</label>
          <input
            id="cam-db-model"
            type="text"
            value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
          />
        </div>
        <div className="properties__row">
          <label htmlFor="cam-db-mount">Mount</label>
          <input
            id="cam-db-mount"
            type="text"
            placeholder="e.g. Sony E"
            value={form.mount}
            onChange={(e) => setForm((f) => ({ ...f, mount: e.target.value }))}
          />
        </div>
        <div className="properties__row">
          <label htmlFor="cam-db-sensor-type">Sensor Type</label>
          <input
            id="cam-db-sensor-type"
            type="text"
            placeholder="e.g. Full Frame"
            value={form.sensorType}
            onChange={(e) => setForm((f) => ({ ...f, sensorType: e.target.value }))}
          />
        </div>
        <div className="properties__row">
          <label htmlFor="cam-db-sensor-w">Sensor Width (mm)</label>
          <input
            id="cam-db-sensor-w"
            type="number"
            min={0}
            step={0.01}
            value={form.sensorWidthMm}
            onChange={(e) => setForm((f) => ({ ...f, sensorWidthMm: e.target.value }))}
          />
        </div>
        <div className="properties__row">
          <label htmlFor="cam-db-sensor-h">Sensor Height (mm)</label>
          <input
            id="cam-db-sensor-h"
            type="number"
            min={0}
            step={0.01}
            value={form.sensorHeightMm}
            onChange={(e) => setForm((f) => ({ ...f, sensorHeightMm: e.target.value }))}
          />
        </div>

        {error && <p className="canvas-area__hint-error">{error}</p>}

        <div className="canvas-area__hint-actions">
          <button type="button" onClick={handleAdd}>
            Add Camera
          </button>
          <button type="button" onClick={close}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
