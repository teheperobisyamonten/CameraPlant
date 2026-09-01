import { getCameraDefinitionsSnapshot } from './cameraCatalog'
import { computeDepthOfField, type DepthOfFieldResult } from '../geometry/depthOfField'
import type { CameraInstance } from '../types/camera'

/** Resolves a CameraInstance's camera/lens/aperture/focus-distance selection into near/far/hyperfocal distances. */
export function resolveCameraDepthOfField(instance: CameraInstance): DepthOfFieldResult | null {
  if (
    !instance.cameraDefinitionId ||
    instance.focalLengthMm == null ||
    instance.apertureFStop == null ||
    instance.focusDistanceM == null
  ) {
    return null
  }
  const definition = getCameraDefinitionsSnapshot().find((c) => c.id === instance.cameraDefinitionId)
  if (!definition) return null
  return computeDepthOfField(
    instance.focalLengthMm,
    instance.apertureFStop,
    definition.sensorWidthMm,
    definition.sensorHeightMm,
    instance.focusDistanceM,
  )
}
