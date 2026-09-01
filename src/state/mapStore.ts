import { create } from 'zustand'
import type { FloorMapImage } from '../types/floorMap'

const ACCEPTED_TYPES = new Set(['image/png', 'image/jpeg'])

interface MapState {
  image: FloorMapImage | null
  error: string | null
  loadFromFile: (file: File) => void
  /** Used to restore a previously-saved map from IndexedDB; skips the MIME check since it was already validated on first load. */
  loadFromBlob: (blob: Blob) => Promise<void>
  clearError: () => void
}

function loadImageFromBlob(
  blob: Blob,
  set: (partial: Partial<MapState>) => void,
  previousUrl: string | undefined,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const element = new Image()

    element.onload = () => {
      if (previousUrl) URL.revokeObjectURL(previousUrl)
      set({
        image: { element, blob, width: element.naturalWidth, height: element.naturalHeight },
        error: null,
      })
      resolve()
    }
    element.onerror = () => {
      URL.revokeObjectURL(url)
      set({ error: 'Failed to load floor map' })
      reject(new Error('Failed to load floor map'))
    }
    element.src = url
  })
}

export const useMapStore = create<MapState>((set, get) => ({
  image: null,
  error: null,

  loadFromFile: (file) => {
    if (!ACCEPTED_TYPES.has(file.type)) {
      set({
        error: 'Failed to load floor map: only PNG or JPEG images are supported.',
      })
      return
    }
    void loadImageFromBlob(file, set, get().image?.element.src).catch(() => {
      /* error already recorded in state */
    })
  },

  loadFromBlob: (blob) => loadImageFromBlob(blob, set, get().image?.element.src),

  clearError: () => set({ error: null }),
}))
