import { create } from 'zustand'
import type { LensDefinition } from '../types/lensDefinition'

interface CustomLensState {
  customLenses: LensDefinition[]
  setCustomLenses: (lenses: LensDefinition[]) => void
  addCustomLens: (lens: LensDefinition) => void
  removeCustomLens: (id: string) => void
}

/**
 * Holds user-added lens definitions. Kept as its own store (rather than
 * folded into cameraStore, which holds per-scene CameraInstance placements)
 * since this is reference/catalog data shared across Sequences and Projects,
 * not part of the undoable scene snapshot. Mirrors customCameraStore.ts.
 */
export const useCustomLensStore = create<CustomLensState>((set) => ({
  customLenses: [],
  setCustomLenses: (lenses) => set({ customLenses: lenses }),
  addCustomLens: (lens) => set((s) => ({ customLenses: [...s.customLenses, lens] })),
  removeCustomLens: (id) =>
    set((s) => ({ customLenses: s.customLenses.filter((l) => l.id !== id) })),
}))
