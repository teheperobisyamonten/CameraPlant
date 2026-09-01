import { useState } from 'react'
import { BUILTIN_CAMERA_DEFINITIONS } from '../data/cameraCatalog'
import { BUILTIN_LENS_DEFINITIONS } from '../data/lensCatalog'
import { deleteCustomCamera, saveCustomCamera } from '../persistence/customCameraPersistence'
import { deleteCustomLens, saveCustomLens } from '../persistence/customLensPersistence'
import { useEquipmentDatabaseUiStore } from '../state/equipmentDatabaseUiStore'
import { useCustomCameraStore } from '../state/customCameraStore'
import { useCustomLensStore } from '../state/customLensStore'
import type { CameraDefinition } from '../types/cameraDefinition'
import type { LensDefinition } from '../types/lensDefinition'

const EMPTY_CAMERA_FORM = {
  manufacturer: '',
  model: '',
  mount: '',
  sensorType: '',
  sensorWidthMm: '',
  sensorHeightMm: '',
}

function lensSummary(lens: LensDefinition): string {
  const focal = lens.type === 'prime' ? `${lens.focalLengthMm}mm` : `${lens.focalMinMm}-${lens.focalMaxMm}mm`
  return `${lens.mount} · ${focal} · f/${lens.maxAperture}`
}

function CameraDbSection() {
  const customCameras = useCustomCameraStore((s) => s.customCameras)
  const addCustomCamera = useCustomCameraStore((s) => s.addCustomCamera)
  const removeCustomCamera = useCustomCameraStore((s) => s.removeCustomCamera)

  const [form, setForm] = useState(EMPTY_CAMERA_FORM)
  const [error, setError] = useState<string | null>(null)

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
    if (
      !Number.isFinite(sensorWidthMm) ||
      sensorWidthMm <= 0 ||
      !Number.isFinite(sensorHeightMm) ||
      sensorHeightMm <= 0
    ) {
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
    setForm(EMPTY_CAMERA_FORM)
    setError(null)
  }

  const handleRemove = (id: string) => {
    removeCustomCamera(id)
    void deleteCustomCamera(id)
  }

  return (
    <>
      <p className="properties__title">Cameras</p>

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
      </div>
    </>
  )
}

const EMPTY_LENS_FORM = {
  manufacturer: '',
  name: '',
  mount: '',
  type: 'zoom' as 'zoom' | 'prime',
  focalMinMm: '',
  focalMaxMm: '',
  focalLengthMm: '',
  maxAperture: '',
  sensorCoverage: '',
}

function LensDbSection() {
  const customLenses = useCustomLensStore((s) => s.customLenses)
  const addCustomLens = useCustomLensStore((s) => s.addCustomLens)
  const removeCustomLens = useCustomLensStore((s) => s.removeCustomLens)

  const [form, setForm] = useState(EMPTY_LENS_FORM)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    const manufacturer = form.manufacturer.trim()
    const name = form.name.trim()
    const mount = form.mount.trim()
    const sensorCoverage = form.sensorCoverage.trim()
    const maxAperture = Number(form.maxAperture)

    if (!manufacturer || !name || !mount) {
      setError('Manufacturer, Name, and Mount are required.')
      return
    }
    if (!Number.isFinite(maxAperture) || maxAperture <= 0) {
      setError('Max Aperture must be a positive number.')
      return
    }

    let lens: LensDefinition
    if (form.type === 'prime') {
      const focalLengthMm = Number(form.focalLengthMm)
      if (!Number.isFinite(focalLengthMm) || focalLengthMm <= 0) {
        setError('Focal Length must be a positive number.')
        return
      }
      lens = {
        id: crypto.randomUUID(),
        manufacturer,
        name,
        mount,
        type: 'prime',
        focalLengthMm,
        maxAperture,
        sensorCoverage: sensorCoverage || 'Custom',
      }
    } else {
      const focalMinMm = Number(form.focalMinMm)
      const focalMaxMm = Number(form.focalMaxMm)
      if (
        !Number.isFinite(focalMinMm) ||
        focalMinMm <= 0 ||
        !Number.isFinite(focalMaxMm) ||
        focalMaxMm <= 0 ||
        focalMinMm >= focalMaxMm
      ) {
        setError('Focal Min must be a positive number less than Focal Max.')
        return
      }
      lens = {
        id: crypto.randomUUID(),
        manufacturer,
        name,
        mount,
        type: 'zoom',
        focalMinMm,
        focalMaxMm,
        maxAperture,
        sensorCoverage: sensorCoverage || 'Custom',
      }
    }

    addCustomLens(lens)
    void saveCustomLens(lens)
    setForm(EMPTY_LENS_FORM)
    setError(null)
  }

  const handleRemove = (id: string) => {
    removeCustomLens(id)
    void deleteCustomLens(id)
  }

  return (
    <>
      <p className="properties__title">Lenses</p>

      <p className="sidebar__section-title">Built-in</p>
      <div className="camera-db__list">
        {BUILTIN_LENS_DEFINITIONS.map((lens) => (
          <div className="camera-db__row" key={lens.id}>
            <span>
              {lens.manufacturer} {lens.name}
            </span>
            <span className="properties__empty">{lensSummary(lens)}</span>
          </div>
        ))}
      </div>

      <p className="sidebar__section-title">Custom</p>
      {customLenses.length === 0 && <p className="properties__empty">No custom lenses yet.</p>}
      <div className="camera-db__list">
        {customLenses.map((lens) => (
          <div className="camera-db__row" key={lens.id}>
            <span>
              {lens.manufacturer} {lens.name}
            </span>
            <span className="properties__empty">{lensSummary(lens)}</span>
            <button type="button" onClick={() => handleRemove(lens.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      <p className="sidebar__section-title">Add Custom Lens</p>
      <div className="properties__row">
        <label htmlFor="lens-db-manufacturer">Manufacturer</label>
        <input
          id="lens-db-manufacturer"
          type="text"
          value={form.manufacturer}
          onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))}
        />
      </div>
      <div className="properties__row">
        <label htmlFor="lens-db-name">Name</label>
        <input
          id="lens-db-name"
          type="text"
          placeholder="e.g. FE 24-70mm F2.8 GM II"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div className="properties__row">
        <label htmlFor="lens-db-mount">Mount</label>
        <input
          id="lens-db-mount"
          type="text"
          placeholder="e.g. Sony E"
          value={form.mount}
          onChange={(e) => setForm((f) => ({ ...f, mount: e.target.value }))}
        />
      </div>
      <div className="properties__row">
        <label htmlFor="lens-db-type">Type</label>
        <select
          id="lens-db-type"
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'zoom' | 'prime' }))}
        >
          <option value="zoom">Zoom</option>
          <option value="prime">Prime</option>
        </select>
      </div>

      {form.type === 'zoom' ? (
        <>
          <div className="properties__row">
            <label htmlFor="lens-db-focal-min">Focal Min (mm)</label>
            <input
              id="lens-db-focal-min"
              type="number"
              min={0}
              step={1}
              value={form.focalMinMm}
              onChange={(e) => setForm((f) => ({ ...f, focalMinMm: e.target.value }))}
            />
          </div>
          <div className="properties__row">
            <label htmlFor="lens-db-focal-max">Focal Max (mm)</label>
            <input
              id="lens-db-focal-max"
              type="number"
              min={0}
              step={1}
              value={form.focalMaxMm}
              onChange={(e) => setForm((f) => ({ ...f, focalMaxMm: e.target.value }))}
            />
          </div>
        </>
      ) : (
        <div className="properties__row">
          <label htmlFor="lens-db-focal-length">Focal Length (mm)</label>
          <input
            id="lens-db-focal-length"
            type="number"
            min={0}
            step={1}
            value={form.focalLengthMm}
            onChange={(e) => setForm((f) => ({ ...f, focalLengthMm: e.target.value }))}
          />
        </div>
      )}

      <div className="properties__row">
        <label htmlFor="lens-db-max-aperture">Max Aperture (f/)</label>
        <input
          id="lens-db-max-aperture"
          type="number"
          min={0}
          step={0.1}
          value={form.maxAperture}
          onChange={(e) => setForm((f) => ({ ...f, maxAperture: e.target.value }))}
        />
      </div>
      <div className="properties__row">
        <label htmlFor="lens-db-sensor-coverage">Sensor Coverage</label>
        <input
          id="lens-db-sensor-coverage"
          type="text"
          placeholder="e.g. Full Frame"
          value={form.sensorCoverage}
          onChange={(e) => setForm((f) => ({ ...f, sensorCoverage: e.target.value }))}
        />
      </div>

      {error && <p className="canvas-area__hint-error">{error}</p>}

      <div className="canvas-area__hint-actions">
        <button type="button" onClick={handleAdd}>
          Add Lens
        </button>
      </div>
    </>
  )
}

export function EquipmentDatabasePanel() {
  const isOpen = useEquipmentDatabaseUiStore((s) => s.isOpen)
  const close = useEquipmentDatabaseUiStore((s) => s.close)

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal camera-db-modal" onClick={(e) => e.stopPropagation()}>
        <p className="properties__title">Equipment Database</p>

        <CameraDbSection />
        <hr className="equipment-db__divider" />
        <LensDbSection />

        <div className="canvas-area__hint-actions">
          <button type="button" onClick={close}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
