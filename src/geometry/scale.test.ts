import { describe, expect, it } from 'vitest'
import { calibrateScale, pixelDistance, pixelsToMeters, metersToPixels } from './scale'

describe('pixelDistance', () => {
  it('computes euclidean distance', () => {
    expect(pixelDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
  })
})

describe('calibrateScale', () => {
  it('computes pixelsPerMeter from the spec example (650px / 5m = 130)', () => {
    const result = calibrateScale({ x: 0, y: 0 }, { x: 650, y: 0 }, 5)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.pixelsPerMeter).toBeCloseTo(130)
    }
  })

  it('rejects a zero real distance', () => {
    const result = calibrateScale({ x: 0, y: 0 }, { x: 650, y: 0 }, 0)
    expect(result).toEqual({ ok: false, error: 'INVALID_DISTANCE' })
  })

  it('rejects a negative real distance', () => {
    const result = calibrateScale({ x: 0, y: 0 }, { x: 650, y: 0 }, -5)
    expect(result).toEqual({ ok: false, error: 'INVALID_DISTANCE' })
  })

  it('rejects NaN real distance', () => {
    const result = calibrateScale({ x: 0, y: 0 }, { x: 650, y: 0 }, NaN)
    expect(result).toEqual({ ok: false, error: 'INVALID_DISTANCE' })
  })

  it('rejects Infinity real distance', () => {
    const result = calibrateScale({ x: 0, y: 0 }, { x: 650, y: 0 }, Infinity)
    expect(result).toEqual({ ok: false, error: 'INVALID_DISTANCE' })
  })

  it('rejects points that are effectively the same location', () => {
    const result = calibrateScale({ x: 10, y: 10 }, { x: 10.5, y: 10 }, 5)
    expect(result).toEqual({ ok: false, error: 'POINTS_TOO_CLOSE' })
  })
})

describe('pixelsToMeters / metersToPixels', () => {
  it('round-trips through a pixelsPerMeter factor', () => {
    const pixelsPerMeter = 130
    expect(pixelsToMeters(650, pixelsPerMeter)).toBeCloseTo(5)
    expect(metersToPixels(5, pixelsPerMeter)).toBeCloseTo(650)
  })
})
