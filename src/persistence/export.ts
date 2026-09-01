import type Konva from 'konva'

export type ExportFormat = 'png' | 'jpeg'
export type ExportMode = 'clean' | 'technical'
export type ExportResolution = 'current' | '1920x1080' | '3840x2160' | 'original'

export interface ExportOptions {
  format: ExportFormat
  mode: ExportMode
  resolution: ExportResolution
  /** 0..1; ignored for PNG (lossless). */
  jpegQuality: number
}

interface ViewportSnapshot {
  scale: number
  x: number
  y: number
  width: number
  height: number
}

function computeExportScale(
  resolution: ExportResolution,
  mapWidth: number,
  mapHeight: number,
  currentScale: number,
): number {
  switch (resolution) {
    case 'original':
      return 1
    case '1920x1080':
      return Math.min(1920 / mapWidth, 1080 / mapHeight)
    case '3840x2160':
      return Math.min(3840 / mapWidth, 2160 / mapHeight)
    case 'current':
    default:
      return currentScale
  }
}

/**
 * Renders the Stage to a PNG/JPEG data URL. For every resolution except
 * 'current', the Stage is temporarily reflowed to show the full Floor Map
 * at the target scale (so export isn't limited to whatever's currently
 * panned/zoomed into view), then restored to the on-screen viewport
 * afterward so editing is unaffected.
 */
export function exportStageToDataURL(
  stage: Konva.Stage,
  mapWidth: number,
  mapHeight: number,
  options: ExportOptions,
): string {
  const original: ViewportSnapshot = {
    scale: stage.scaleX(),
    x: stage.x(),
    y: stage.y(),
    width: stage.width(),
    height: stage.height(),
  }

  const isFullMapExport = options.resolution !== 'current'
  if (isFullMapExport) {
    const exportScale = computeExportScale(options.resolution, mapWidth, mapHeight, original.scale)
    stage.scale({ x: exportScale, y: exportScale })
    stage.position({ x: 0, y: 0 })
    stage.width(Math.max(1, Math.round(mapWidth * exportScale)))
    stage.height(Math.max(1, Math.round(mapHeight * exportScale)))
    stage.batchDraw()
  }

  try {
    const mimeType = options.format === 'jpeg' ? 'image/jpeg' : 'image/png'
    return stage.toDataURL({
      mimeType,
      quality: options.format === 'jpeg' ? options.jpegQuality : undefined,
      pixelRatio: 1,
    })
  } finally {
    if (isFullMapExport) {
      stage.scale({ x: original.scale, y: original.scale })
      stage.position({ x: original.x, y: original.y })
      stage.width(original.width)
      stage.height(original.height)
      stage.batchDraw()
    }
  }
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
