export interface DepthOfFieldResult {
  nearM: number
  /** null means the far limit is beyond the hyperfocal distance (effectively infinite). */
  farM: number | null
  hyperfocalM: number
}

/** Circle-of-confusion approximation: sensor diagonal / 1500 (a common DoF-calculator convention). */
const COC_DIVISOR = 1500

function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

/**
 * Standard photographic DoF equations. All internal distances are computed in mm
 * (matching focalLengthMm) and converted back to meters for the result.
 */
export function computeDepthOfField(
  focalLengthMm: number,
  fStop: number,
  sensorWidthMm: number,
  sensorHeightMm: number,
  focusDistanceM: number,
): DepthOfFieldResult | null {
  if (
    !isPositiveFinite(focalLengthMm) ||
    !isPositiveFinite(fStop) ||
    !isPositiveFinite(sensorWidthMm) ||
    !isPositiveFinite(sensorHeightMm) ||
    !isPositiveFinite(focusDistanceM)
  ) {
    return null
  }

  const focusDistanceMm = focusDistanceM * 1000
  if (focusDistanceMm <= focalLengthMm) return null

  const cocMm = Math.hypot(sensorWidthMm, sensorHeightMm) / COC_DIVISOR
  const hyperfocalMm = (focalLengthMm * focalLengthMm) / (fStop * cocMm) + focalLengthMm

  const nearMm = (hyperfocalMm * focusDistanceMm) / (hyperfocalMm + (focusDistanceMm - focalLengthMm))
  const isFarInfinite = focusDistanceMm >= hyperfocalMm
  const farMm = isFarInfinite
    ? null
    : (hyperfocalMm * focusDistanceMm) / (hyperfocalMm - (focusDistanceMm - focalLengthMm))

  return {
    nearM: nearMm / 1000,
    farM: farMm !== null ? farMm / 1000 : null,
    hyperfocalM: hyperfocalMm / 1000,
  }
}
