import { create } from 'zustand'
import type { FloorMapImage } from '../types/floorMap'

const ACCEPTED_TYPES = new Set(['image/png', 'image/jpeg'])

interface MapState {
  image: FloorMapImage | null
  error: string | null
  loadFromFile: (file: File) => void
  clearError: () => void
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

    const previousUrl = get().image?.element.src
    const url = URL.createObjectURL(file)
    const element = new Image()

    element.onload = () => {
      if (previousUrl) URL.revokeObjectURL(previousUrl)
      set({
        image: { element, width: element.naturalWidth, height: element.naturalHeight },
        error: null,
      })
    }
    element.onerror = () => {
      URL.revokeObjectURL(url)
      set({ error: 'Failed to load floor map' })
    }
    element.src = url
  },

  clearError: () => set({ error: null }),
}))
