import { create } from 'zustand'
import type { DrawingObject } from '../types/drawing'

interface DrawingState {
  drawings: DrawingObject[]
  addDrawing: (drawing: DrawingObject) => void
  removeDrawing: (id: string) => void
}

export const useDrawingStore = create<DrawingState>((set) => ({
  drawings: [],

  addDrawing: (drawing) => set((s) => ({ drawings: [...s.drawings, drawing] })),

  removeDrawing: (id) => set((s) => ({ drawings: s.drawings.filter((d) => d.id !== id) })),
}))
