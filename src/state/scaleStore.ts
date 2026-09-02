import { create } from 'zustand'
import { calibrateScale, type Point } from '../geometry/scale'

interface ScaleState {
  pixelsPerMeter: number | null
  isCalibrating: boolean
  pointA: Point | null
  pointB: Point | null
  error: string | null
  startCalibration: () => void
  addPoint: (point: Point) => void
  confirmRealDistance: (meters: number) => void
  cancelCalibration: () => void
  /**
   * Recalibrates pixelsPerMeter from an arbitrary pair of points (e.g. a Measure
   * tool line) instead of the pointA/pointB 2-click flow. Returns whether it
   * succeeded; on failure, `error` is set for the caller to display.
   */
  calibrateFromMeasurement: (pointA: Point, pointB: Point, meters: number) => boolean
  /** Directly sets pixelsPerMeter (e.g. typed into the Scale field). Returns whether it succeeded. */
  setPixelsPerMeter: (value: number) => boolean
}

const ERROR_MESSAGES: Record<string, string> = {
  POINTS_TOO_CLOSE: 'Selected points are too close together. Choose two distinct points.',
  INVALID_DISTANCE: 'Real distance must be a positive number.',
}

export const useScaleStore = create<ScaleState>((set, get) => ({
  pixelsPerMeter: null,
  isCalibrating: false,
  pointA: null,
  pointB: null,
  error: null,

  startCalibration: () => set({ isCalibrating: true, pointA: null, pointB: null, error: null }),

  addPoint: (point) => {
    const { isCalibrating, pointA, pointB } = get()
    if (!isCalibrating || pointB) return
    if (!pointA) {
      set({ pointA: point })
    } else {
      set({ pointB: point })
    }
  },

  confirmRealDistance: (meters) => {
    const { pointA, pointB } = get()
    if (!pointA || !pointB) return

    const result = calibrateScale(pointA, pointB, meters)
    if (!result.ok) {
      set({ error: ERROR_MESSAGES[result.error] })
      return
    }

    set({
      pixelsPerMeter: result.pixelsPerMeter,
      isCalibrating: false,
      pointA: null,
      pointB: null,
      error: null,
    })
  },

  cancelCalibration: () => set({ isCalibrating: false, pointA: null, pointB: null, error: null }),

  calibrateFromMeasurement: (pointA, pointB, meters) => {
    const result = calibrateScale(pointA, pointB, meters)
    if (!result.ok) {
      set({ error: ERROR_MESSAGES[result.error] })
      return false
    }
    set({ pixelsPerMeter: result.pixelsPerMeter, error: null })
    return true
  },

  setPixelsPerMeter: (value) => {
    if (!Number.isFinite(value) || value <= 0) {
      set({ error: ERROR_MESSAGES.INVALID_DISTANCE })
      return false
    }
    set({ pixelsPerMeter: value, error: null })
    return true
  },
}))
