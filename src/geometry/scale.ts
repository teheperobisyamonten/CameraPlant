export interface Point {
  x: number
  y: number
}

/** Minimum pixel distance between calibration points to avoid a divide-by-near-zero scale. */
const MIN_PIXEL_DISTANCE = 2

export function pixelDistance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

export type ScaleCalibrationError = 'POINTS_TOO_CLOSE' | 'INVALID_DISTANCE'

export type ScaleCalibrationResult =
  | { ok: true; pixelsPerMeter: number }
  | { ok: false; error: ScaleCalibrationError }

export function calibrateScale(
  pointA: Point,
  pointB: Point,
  realDistanceMeters: number,
): ScaleCalibrationResult {
  const pxDistance = pixelDistance(pointA, pointB)

  if (!Number.isFinite(pxDistance) || pxDistance < MIN_PIXEL_DISTANCE) {
    return { ok: false, error: 'POINTS_TOO_CLOSE' }
  }

  if (!Number.isFinite(realDistanceMeters) || realDistanceMeters <= 0) {
    return { ok: false, error: 'INVALID_DISTANCE' }
  }

  const pixelsPerMeter = pxDistance / realDistanceMeters

  if (!Number.isFinite(pixelsPerMeter) || pixelsPerMeter <= 0) {
    return { ok: false, error: 'INVALID_DISTANCE' }
  }

  return { ok: true, pixelsPerMeter }
}

export function pixelsToMeters(pixels: number, pixelsPerMeter: number): number {
  return pixels / pixelsPerMeter
}

export function metersToPixels(meters: number, pixelsPerMeter: number): number {
  return meters * pixelsPerMeter
}
