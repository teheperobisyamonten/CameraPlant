import { create } from 'zustand'
import type { CameraDefinition } from '../types/cameraDefinition'

interface CustomCameraState {
  customCameras: CameraDefinition[]
  setCustomCameras: (cameras: CameraDefinition[]) => void
  addCustomCamera: (camera: CameraDefinition) => void
  removeCustomCamera: (id: string) => void
}

/**
 * Holds user-added camera definitions. Kept as its own store (rather than
 * folded into cameraStore, which holds per-scene CameraInstance placements)
 * since this is reference/catalog data shared across Sequences and Projects,
 * not part of the undoable scene snapshot.
 */
export const useCustomCameraStore = create<CustomCameraState>((set) => ({
  customCameras: [],
  setCustomCameras: (cameras) => set({ customCameras: cameras }),
  addCustomCamera: (camera) => set((s) => ({ customCameras: [...s.customCameras, camera] })),
  removeCustomCamera: (id) =>
    set((s) => ({ customCameras: s.customCameras.filter((c) => c.id !== id) })),
}))
