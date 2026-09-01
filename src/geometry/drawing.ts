import { pixelDistance, type Point } from './scale'
import type { DrawingObject } from '../types/drawing'

export function distancePointToSegment(p: Point, a: Point, b: Point): number {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const lengthSq = abx * abx + aby * aby
  if (lengthSq === 0) return pixelDistance(p, a)

  let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / lengthSq
  t = Math.max(0, Math.min(1, t))
  const projection = { x: a.x + t * abx, y: a.y + t * aby }
  return pixelDistance(p, projection)
}

export function isPointInRect(
  p: Point,
  x: number,
  y: number,
  width: number,
  height: number,
): boolean {
  return p.x >= x && p.x <= x + width && p.y >= y && p.y <= y + height
}

export function isPointInCircle(p: Point, cx: number, cy: number, radius: number): boolean {
  return pixelDistance(p, { x: cx, y: cy }) <= radius
}

/** Rough hit-test used by the Eraser tool; `tolerance` is in canvas pixels. */
export function hitTestDrawing(point: Point, drawing: DrawingObject, tolerance: number): boolean {
  switch (drawing.type) {
    case 'pen': {
      const pts = drawing.points
      for (let i = 0; i + 3 < pts.length; i += 2) {
        const a = { x: pts[i], y: pts[i + 1] }
        const b = { x: pts[i + 2], y: pts[i + 3] }
        if (distancePointToSegment(point, a, b) <= tolerance) return true
      }
      return false
    }
    case 'line':
    case 'arrow':
    case 'measure': {
      const [x1, y1, x2, y2] = drawing.points
      return distancePointToSegment(point, { x: x1, y: y1 }, { x: x2, y: y2 }) <= tolerance
    }
    case 'rectangle':
      return isPointInRect(
        point,
        drawing.x - tolerance,
        drawing.y - tolerance,
        drawing.width + tolerance * 2,
        drawing.height + tolerance * 2,
      )
    case 'circle':
      return isPointInCircle(point, drawing.x, drawing.y, drawing.radius + tolerance)
    case 'text':
      return isPointInRect(
        point,
        drawing.x - tolerance,
        drawing.y - tolerance,
        120 + tolerance * 2,
        drawing.fontSize + tolerance * 2,
      )
    default:
      return false
  }
}
