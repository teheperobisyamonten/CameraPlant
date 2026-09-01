import { getCameraDefinitionsSnapshot } from './cameraCatalog'
import { computeFov, type FovResult } from '../geometry/fov'
import type { CameraInstance } from '../types/camera'

/** Resolves a CameraInstance's camera/lens/focal-length selection into an HFOV/VFOV, or null if incomplete/invalid. */
export function resolveCameraFov(instance: CameraInstance): FovResult | null {
  if (!instance.cameraDefinitionId || instance.focalLengthMm == null) return null
  const definition = getCameraDefinitionsSnapshot().find((c) => c.id === instance.cameraDefinitionId)
  if (!definition) return null
  return computeFov(definition.sensorWidthMm, definition.sensorHeightMm, instance.focalLengthMm)
}
