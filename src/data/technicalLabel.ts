import { getCameraDefinitionsSnapshot } from './cameraCatalog'
import { getLensDefinitionsSnapshot } from './lensCatalog'
import { resolveCameraFov } from './resolveFov'
import { distanceMeters } from '../geometry/distance'
import type { CameraInstance } from '../types/camera'
import type { SubjectInstance } from '../types/subject'

/** Camera Name/Model/Lens/Focal Length/HFOV/Distance lines for the Technical export overlay (spec Section 38). */
export function buildCameraTechnicalLines(
  camera: CameraInstance,
  subjects: SubjectInstance[],
  pixelsPerMeter: number | null,
): string[] {
  const cameraDefinition = getCameraDefinitionsSnapshot().find(
    (c) => c.id === camera.cameraDefinitionId,
  )
  const lensDefinition = getLensDefinitionsSnapshot().find((l) => l.id === camera.lensDefinitionId)
  const fov = resolveCameraFov(camera)

  const lines = [
    camera.name,
    cameraDefinition ? `${cameraDefinition.manufacturer} ${cameraDefinition.model}` : 'Camera: Not set',
    lensDefinition ? `${lensDefinition.manufacturer} ${lensDefinition.name}` : 'Lens: Not set',
    camera.focalLengthMm ? `${camera.focalLengthMm}mm` : 'Focal Length: Not set',
    fov ? `HFOV ${fov.horizontalDeg.toFixed(1)}°` : 'HFOV: Not set',
  ]

  for (const subject of subjects) {
    const meters = distanceMeters(camera, subject, pixelsPerMeter)
    lines.push(
      `${subject.name}: ${meters !== null ? `${meters.toFixed(2)} m` : 'Scale not configured'}`,
    )
  }

  return lines
}
