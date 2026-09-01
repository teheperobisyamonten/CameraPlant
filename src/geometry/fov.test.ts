import { describe, expect, it } from 'vitest'
import { computeFov } from './fov'

describe('computeFov', () => {
  it('matches the spec worked example (full-frame width 36mm @ 50mm)', () => {
    const result = computeFov(36, 24, 50)
    expect(result).not.toBeNull()
    // 2*atan(36/100) = 39.6 deg
    expect(result!.horizontalDeg).toBeCloseTo(39.6, 1)
  })

  it('narrows as focal length increases (telephoto)', () => {
    const wide = computeFov(36, 24, 24)!
    const tele = computeFov(36, 24, 200)!
    expect(tele.horizontalDeg).toBeLessThan(wide.horizontalDeg)
    expect(tele.verticalDeg).toBeLessThan(wide.verticalDeg)
  })

  it('widens as focal length decreases (wide-angle)', () => {
    const normal = computeFov(36, 24, 50)!
    const wide = computeFov(36, 24, 14)!
    expect(wide.horizontalDeg).toBeGreaterThan(normal.horizontalDeg)
  })

  it('rejects a non-positive sensor width', () => {
    expect(computeFov(0, 24, 50)).toBeNull()
    expect(computeFov(-10, 24, 50)).toBeNull()
  })

  it('rejects a non-positive focal length', () => {
    expect(computeFov(36, 24, 0)).toBeNull()
    expect(computeFov(36, 24, -50)).toBeNull()
  })

  it('rejects NaN/Infinity inputs', () => {
    expect(computeFov(NaN, 24, 50)).toBeNull()
    expect(computeFov(36, 24, Infinity)).toBeNull()
  })
})
