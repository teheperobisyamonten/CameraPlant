import { useState } from 'react'
import Konva from 'konva'
import { buildCameraTechnicalLines } from '../data/technicalLabel'
import {
  downloadDataUrl,
  exportStageToDataURL,
  type ExportFormat,
  type ExportMode,
  type ExportResolution,
} from '../persistence/export'
import { useCameraStore } from '../state/cameraStore'
import { useExportUiStore } from '../state/exportUiStore'
import { useMapStore } from '../state/mapStore'
import { useScaleStore } from '../state/scaleStore'
import { useSelectionStore } from '../state/selectionStore'
import { useSubjectStore } from '../state/subjectStore'
import { canvasRefs } from './canvas/canvasRefs'

const DEFAULT_JPEG_QUALITY = 90

export function ExportPanel() {
  const isOpen = useExportUiStore((s) => s.isOpen)
  const close = useExportUiStore((s) => s.close)

  const [format, setFormat] = useState<ExportFormat>('png')
  const [mode, setMode] = useState<ExportMode>('clean')
  const [resolution, setResolution] = useState<ExportResolution>('current')
  const [jpegQuality, setJpegQuality] = useState(DEFAULT_JPEG_QUALITY)
  const [error, setError] = useState<string | null>(null)

  const image = useMapStore((s) => s.image)
  const cameras = useCameraStore((s) => s.cameras)
  const subjects = useSubjectStore((s) => s.subjects)
  const pixelsPerMeter = useScaleStore((s) => s.pixelsPerMeter)
  const select = useSelectionStore((s) => s.select)

  if (!isOpen) return null

  const handleExport = () => {
    const stage = canvasRefs.stage
    if (!stage || !image) {
      setError('Image export failed.')
      return
    }

    let technicalLayer: Konva.Layer | null = null
    try {
      // Selection handles must never appear in an export.
      select(null)
      canvasRefs.transformer?.nodes([])

      if (mode === 'technical') {
        technicalLayer = new Konva.Layer({ listening: false })
        for (const camera of cameras) {
          const lines = buildCameraTechnicalLines(camera, subjects, pixelsPerMeter)
          const text = new Konva.Text({
            x: camera.x + 24,
            y: camera.y - 10,
            text: lines.join('\n'),
            fontSize: 12,
            fill: '#ffffff',
            padding: 6,
            lineHeight: 1.4,
          })
          const background = new Konva.Rect({
            x: text.x(),
            y: text.y(),
            width: text.width(),
            height: text.height(),
            fill: 'rgba(13, 27, 34, 0.75)',
            cornerRadius: 4,
          })
          technicalLayer.add(background)
          technicalLayer.add(text)
        }
        stage.add(technicalLayer)
      }

      const dataUrl = exportStageToDataURL(stage, image.width, image.height, {
        format,
        mode,
        resolution,
        jpegQuality: jpegQuality / 100,
      })

      const extension = format === 'jpeg' ? 'jpg' : 'png'
      downloadDataUrl(dataUrl, `camera-plan-export.${extension}`)
      setError(null)
      close()
    } catch (err) {
      console.error('Image export failed:', err)
      setError('Image export failed.')
    } finally {
      technicalLayer?.destroy()
      stage.batchDraw()
    }
  }

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <p className="properties__title">Export</p>

        {!image && <p className="canvas-area__hint-error">Please load a floor map first.</p>}

        <div className="properties__row">
          <label htmlFor="export-format">Format</label>
          <select
            id="export-format"
            value={format}
            onChange={(e) => setFormat(e.target.value as ExportFormat)}
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
          </select>
        </div>

        {format === 'jpeg' && (
          <div className="properties__row">
            <label htmlFor="export-jpeg-quality">Quality</label>
            <select
              id="export-jpeg-quality"
              value={jpegQuality}
              onChange={(e) => setJpegQuality(Number(e.target.value))}
            >
              <option value={70}>70</option>
              <option value={80}>80</option>
              <option value={90}>90</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}

        <div className="properties__row">
          <label htmlFor="export-mode">Mode</label>
          <select id="export-mode" value={mode} onChange={(e) => setMode(e.target.value as ExportMode)}>
            <option value="clean">Clean</option>
            <option value="technical">Technical</option>
          </select>
        </div>

        <div className="properties__row">
          <label htmlFor="export-resolution">Resolution</label>
          <select
            id="export-resolution"
            value={resolution}
            onChange={(e) => setResolution(e.target.value as ExportResolution)}
          >
            <option value="current">Current View</option>
            <option value="original">Original Map Size</option>
            <option value="1920x1080">1920 × 1080</option>
            <option value="3840x2160">3840 × 2160</option>
          </select>
        </div>

        {error && <p className="canvas-area__hint-error">{error}</p>}

        <div className="canvas-area__hint-actions">
          <button type="button" disabled={!image} onClick={handleExport}>
            Export
          </button>
          <button type="button" onClick={close}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
