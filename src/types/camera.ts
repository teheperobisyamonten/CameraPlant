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
  /** f-number the shot is taken at; null until a lens is selected. Clamped to >= the lens's maxAperture. */
  apertureFStop: number | null
  /** Distance from camera to the focus plane, in meters; null until a lens is selected. */
  focusDistanceM: number | null
}
