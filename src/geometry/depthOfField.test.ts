import { describe, expect, it } from 'vitest'
import { computeDepthOfField } from './depthOfField'

describe('computeDepthOfField', () => {
  it('narrows (shallower DoF) as aperture widens (lower f-number)', () => {
    const wide = computeDepthOfField(50, 1.4, 36, 24, 3)!
    const narrow = computeDepthOfField(50, 11, 36, 24, 3)!
    const wideSpan = (wide.farM ?? Infinity) - wide.nearM
    const narrowSpan = (narrow.farM ?? Infinity) - narrow.nearM
    expect(wideSpan).toBeLessThan(narrowSpan)
  })

  it('widens (deeper DoF) as focal length shortens', () => {
    const telephoto = computeDepthOfField(200, 2.8, 36, 24, 5)!
    const wideAngle = computeDepthOfField(24, 2.8, 36, 24, 5)!
    const teleSpan = (telephoto.farM ?? Infinity) - telephoto.nearM
    const wideSpan = (wideAngle.farM ?? Infinity) - wideAngle.nearM
    expect(wideSpan).toBeGreaterThan(teleSpan)
  })

  it('reports an infinite far limit once focus distance reaches the hyperfocal distance', () => {
    const result = computeDepthOfField(24, 16, 36, 24, 1000)!
    expect(result.farM).toBeNull()
  })

  it('places near/far around the focus distance', () => {
    const result = computeDepthOfField(50, 4, 36, 24, 5)!
    expect(result.nearM).toBeLessThan(5)
    expect(result.farM === null || result.farM > 5).toBe(true)
  })

  it('rejects non-positive or non-finite inputs', () => {
    expect(computeDepthOfField(0, 2.8, 36, 24, 5)).toBeNull()
    expect(computeDepthOfField(50, 0, 36, 24, 5)).toBeNull()
    expect(computeDepthOfField(50, 2.8, 36, 24, 0)).toBeNull()
    expect(computeDepthOfField(50, 2.8, 36, 24, NaN)).toBeNull()
  })

  it('rejects a focus distance at or inside the focal length', () => {
    expect(computeDepthOfField(50, 2.8, 36, 24, 0.03)).toBeNull()
  })
})
