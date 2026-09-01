import { describe, expect, it } from 'vitest'
import { distancePointToSegment, hitTestDrawing, isPointInCircle, isPointInRect } from './drawing'
import type { CircleDrawing, LineDrawing, RectangleDrawing } from '../types/drawing'

describe('distancePointToSegment', () => {
  it('is zero for a point on the segment', () => {
    expect(distancePointToSegment({ x: 5, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBeCloseTo(0)
  })

  it('measures perpendicular distance to the segment', () => {
    expect(distancePointToSegment({ x: 5, y: 5 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBeCloseTo(5)
  })

  it('clamps to the nearest endpoint beyond the segment', () => {
    expect(distancePointToSegment({ x: 20, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBeCloseTo(10)
  })
})

describe('isPointInRect / isPointInCircle', () => {
  it('detects containment', () => {
    expect(isPointInRect({ x: 5, y: 5 }, 0, 0, 10, 10)).toBe(true)
    expect(isPointInRect({ x: 15, y: 5 }, 0, 0, 10, 10)).toBe(false)
    expect(isPointInCircle({ x: 3, y: 0 }, 0, 0, 5)).toBe(true)
    expect(isPointInCircle({ x: 6, y: 0 }, 0, 0, 5)).toBe(false)
  })
})

describe('hitTestDrawing', () => {
  const line: LineDrawing = {
    id: 'l1',
    type: 'line',
    points: [0, 0, 10, 0],
    color: '#fff',
    strokeWidth: 2,
  }
  const rect: RectangleDrawing = {
    id: 'r1',
    type: 'rectangle',
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    color: '#fff',
    strokeWidth: 2,
  }
  const circle: CircleDrawing = {
    id: 'c1',
    type: 'circle',
    x: 0,
    y: 0,
    radius: 5,
    color: '#fff',
    strokeWidth: 2,
  }

  it('hits a line within tolerance', () => {
    expect(hitTestDrawing({ x: 5, y: 1 }, line, 2)).toBe(true)
    expect(hitTestDrawing({ x: 5, y: 10 }, line, 2)).toBe(false)
  })

  it('hits a rectangle by containment', () => {
    expect(hitTestDrawing({ x: 5, y: 5 }, rect, 0)).toBe(true)
    expect(hitTestDrawing({ x: 50, y: 50 }, rect, 0)).toBe(false)
  })

  it('hits a circle by containment', () => {
    expect(hitTestDrawing({ x: 1, y: 1 }, circle, 0)).toBe(true)
    expect(hitTestDrawing({ x: 50, y: 50 }, circle, 0)).toBe(false)
  })
})
