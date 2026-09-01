/**
 * Position is stored in canvas/image pixel space (same space as the Floor Map
 * image and Scale Calibration points), not meters — placement must work even
 * before Scale Calibration has been done. Meter readouts are derived on
 * demand via geometry/scale.ts using the current pixelsPerMeter.
 */
export interface CameraInstance {
  id: string
  name: string
  x: number
  y: number
  rotationDeg: number
  cameraDefinitionId: string | null
  lensDefinitionId: string | null
  focalLengthMm: number | null
}
