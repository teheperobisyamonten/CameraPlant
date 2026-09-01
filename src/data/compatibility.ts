import type { CameraDefinition } from '../types/cameraDefinition'
import type { LensDefinition } from '../types/lensDefinition'

export function isLensCompatible(camera: CameraDefinition, lens: LensDefinition): boolean {
  return camera.mount === lens.mount
}

export function getCompatibleLenses(
  camera: CameraDefinition,
  lenses: LensDefinition[],
): LensDefinition[] {
  return lenses.filter((lens) => isLensCompatible(camera, lens))
}

/** Clamps a requested focal length into the lens's supported range (fixed for a prime). */
export function clampFocalLength(lens: LensDefinition, requestedMm: number): number {
  if (lens.type === 'prime') return lens.focalLengthMm
  if (!Number.isFinite(requestedMm)) return lens.focalMinMm
  return Math.min(lens.focalMaxMm, Math.max(lens.focalMinMm, requestedMm))
}
