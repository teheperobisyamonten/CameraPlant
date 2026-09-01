import { describe, expect, it } from 'vitest'
import { distanceMeters } from './distance'

describe('distanceMeters', () => {
  it('converts pixel distance to meters using pixelsPerMeter', () => {
    // 130px/m, points 650px apart horizontally -> 5m
    expect(distanceMeters({ x: 0, y: 0 }, { x: 650, y: 0 }, 130)).toBeCloseTo(5)
  })

  it('returns null when Scale is not configured', () => {
    expect(distanceMeters({ x: 0, y: 0 }, { x: 650, y: 0 }, null)).toBeNull()
  })

  it('handles diagonal distances', () => {
    // 3-4-5 triangle scaled by 100px/m -> 500px hypotenuse -> 5m
    expect(distanceMeters({ x: 0, y: 0 }, { x: 300, y: 400 }, 100)).toBeCloseTo(5)
  })
})
