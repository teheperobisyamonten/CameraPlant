export interface FovResult {
  horizontalDeg: number
  verticalDeg: number
}

function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI
}

/**
 * FOV = 2 * atan(sensorSize / (2 * focalLength)), converted from radians to degrees.
 * Returns null for non-physical input (sensor size or focal length <= 0, NaN, Infinity)
 * rather than propagating NaN/Infinity into the caller.
 */
export function computeFov(
  sensorWidthMm: number,
  sensorHeightMm: number,
  focalLengthMm: number,
): FovResult | null {
  const isValidMeasurement = (value: number) => Number.isFinite(value) && value > 0

  if (
    !isValidMeasurement(sensorWidthMm) ||
    !isValidMeasurement(sensorHeightMm) ||
    !isValidMeasurement(focalLengthMm)
  ) {
    return null
  }

  const horizontalDeg = 2 * radToDeg(Math.atan(sensorWidthMm / (2 * focalLengthMm)))
  const verticalDeg = 2 * radToDeg(Math.atan(sensorHeightMm / (2 * focalLengthMm)))

  return { horizontalDeg, verticalDeg }
}
