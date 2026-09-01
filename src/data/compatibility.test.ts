import { describe, expect, it } from 'vitest'
import { clampFocalLength, getCompatibleLenses, isLensCompatible } from './compatibility'
import type { CameraDefinition } from '../types/cameraDefinition'
import type { PrimeLensDefinition, ZoomLensDefinition } from '../types/lensDefinition'

const sonyCamera: CameraDefinition = {
  id: 'sony_fx3',
  manufacturer: 'Sony',
  model: 'FX3',
  mount: 'Sony E',
  sensorType: 'Full Frame',
  sensorWidthMm: 35.6,
  sensorHeightMm: 23.8,
}

const canonCamera: CameraDefinition = {
  ...sonyCamera,
  id: 'canon_eos_r5c',
  manufacturer: 'Canon',
  model: 'EOS R5 C',
  mount: 'Canon RF',
}

const sonyZoom: ZoomLensDefinition = {
  id: 'sony_fe_24_70_gm2',
  manufacturer: 'Sony',
  name: 'FE 24-70mm F2.8 GM II',
  mount: 'Sony E',
  type: 'zoom',
  focalMinMm: 24,
  focalMaxMm: 70,
  maxAperture: 2.8,
  sensorCoverage: 'Full Frame',
}

const sonyPrime: PrimeLensDefinition = {
  id: 'sony_fe_50_f12_gm',
  manufacturer: 'Sony',
  name: 'FE 50mm F1.2 GM',
  mount: 'Sony E',
  type: 'prime',
  focalLengthMm: 50,
  maxAperture: 1.2,
  sensorCoverage: 'Full Frame',
}

describe('isLensCompatible', () => {
  it('matches on mount', () => {
    expect(isLensCompatible(sonyCamera, sonyZoom)).toBe(true)
  })

  it('rejects a mismatched mount', () => {
    expect(isLensCompatible(canonCamera, sonyZoom)).toBe(false)
  })
})

describe('getCompatibleLenses', () => {
  it('filters to only lenses matching the camera mount', () => {
    const result = getCompatibleLenses(sonyCamera, [sonyZoom, sonyPrime])
    expect(result).toEqual([sonyZoom, sonyPrime])
    expect(getCompatibleLenses(canonCamera, [sonyZoom, sonyPrime])).toEqual([])
  })
})

describe('clampFocalLength', () => {
  it('clamps a zoom focal length to its range', () => {
    expect(clampFocalLength(sonyZoom, 10)).toBe(24)
    expect(clampFocalLength(sonyZoom, 500)).toBe(70)
    expect(clampFocalLength(sonyZoom, 35)).toBe(35)
  })

  it('always returns the fixed focal length for a prime', () => {
    expect(clampFocalLength(sonyPrime, 24)).toBe(50)
  })

  it('falls back to focalMinMm for a non-finite request', () => {
    expect(clampFocalLength(sonyZoom, NaN)).toBe(24)
  })
})
