import { create } from 'zustand'
import type { CameraInstance } from '../types/camera'
import { autoName } from '../utils/autoNumber'

interface CameraState {
  cameras: CameraInstance[]
  /** Monotonically increasing; not derived from array length so names stay unique after deletes. */
  nextNameIndex: number
  addCamera: (position: { x: number; y: number }) => string
  updateCamera: (id: string, patch: Partial<Omit<CameraInstance, 'id'>>) => void
  removeCamera: (id: string) => void
}

export const useCameraStore = create<CameraState>((set, get) => ({
  cameras: [],
  nextNameIndex: 0,

  addCamera: (position) => {
    const id = crypto.randomUUID()
    const { nextNameIndex } = get()
    const camera: CameraInstance = {
      id,
      name: autoName('Camera', nextNameIndex),
      x: position.x,
      y: position.y,
      rotationDeg: 0,
      cameraDefinitionId: null,
      lensDefinitionId: null,
      focalLengthMm: null,
      apertureFStop: null,
      focusDistanceM: null,
    }
    set((s) => ({ cameras: [...s.cameras, camera], nextNameIndex: s.nextNameIndex + 1 }))
    return id
  },

  updateCamera: (id, patch) => {
    set((s) => ({
      cameras: s.cameras.map((camera) => (camera.id === id ? { ...camera, ...patch } : camera)),
    }))
  },

  removeCamera: (id) => {
    set((s) => ({ cameras: s.cameras.filter((camera) => camera.id !== id) }))
  },
}))
