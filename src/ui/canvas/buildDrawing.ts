import type { ToolMode } from '../../state/toolStore'
import type { DrawingObject } from '../../types/drawing'

const MIN_SHAPE_SIZE_PX = 2

/** Builds the final DrawingObject for a drag-to-draw tool (line/arrow/rectangle/circle/measure). */
export function buildDrawingFromDrag(
  tool: ToolMode,
  start: { x: number; y: number },
  end: { x: number; y: number },
  color: string,
  strokeWidth: number,
): DrawingObject | null {
  const id = crypto.randomUUID()

  switch (tool) {
    case 'line':
      return { id, type: 'line', points: [start.x, start.y, end.x, end.y], color, strokeWidth }

    case 'arrow':
      return { id, type: 'arrow', points: [start.x, start.y, end.x, end.y], color, strokeWidth }

    case 'measure':
      return { id, type: 'measure', points: [start.x, start.y, end.x, end.y], color, strokeWidth }

    case 'rectangle': {
      const x = Math.min(start.x, end.x)
      const y = Math.min(start.y, end.y)
      const width = Math.abs(end.x - start.x)
      const height = Math.abs(end.y - start.y)
      if (width < MIN_SHAPE_SIZE_PX || height < MIN_SHAPE_SIZE_PX) return null
      return { id, type: 'rectangle', x, y, width, height, color, strokeWidth }
    }

    case 'circle': {
      const radius = Math.hypot(end.x - start.x, end.y - start.y)
      if (radius < MIN_SHAPE_SIZE_PX) return null
      return { id, type: 'circle', x: start.x, y: start.y, radius, color, strokeWidth }
    }

    default:
      return null
  }
}
