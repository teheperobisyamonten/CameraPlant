import { pixelDistance, pixelsToMeters, type Point } from './scale'

/** Euclidean distance between two canvas points, converted to meters. Null when Scale isn't configured. */
export function distanceMeters(a: Point, b: Point, pixelsPerMeter: number | null): number | null {
  if (!pixelsPerMeter) return null
  return pixelsToMeters(pixelDistance(a, b), pixelsPerMeter)
}
