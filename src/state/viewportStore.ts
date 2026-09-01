import { create } from 'zustand'

export const MIN_SCALE = 0.05
export const MAX_SCALE = 8

interface ViewportState {
  scale: number
  x: number
  y: number
  /** Incremented whenever a Reset View is requested; CanvasStage watches this. */
  resetToken: number
  setTransform: (transform: Partial<{ scale: number; x: number; y: number }>) => void
  requestReset: () => void
}

export const useViewportStore = create<ViewportState>((set) => ({
  scale: 1,
  x: 0,
  y: 0,
  resetToken: 0,
  setTransform: (transform) => set(transform),
  requestReset: () => set((s) => ({ resetToken: s.resetToken + 1 })),
}))
