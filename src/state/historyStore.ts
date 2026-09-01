import { create } from 'zustand'
import { applySceneSnapshot, captureSceneSnapshot, type SceneSnapshot } from './snapshot'

const MAX_HISTORY = 100

interface HistoryState {
  past: SceneSnapshot[]
  future: SceneSnapshot[]
  /** Call BEFORE a mutation (add/move/rotate/delete/property change) to record one undoable step. */
  commit: () => void
  undo: () => void
  redo: () => void
  /** Clears history — used when switching Sequences, since past/future belong to the sequence being left. */
  reset: () => void
}

/**
 * Undo/Redo for Camera and Subject instances (Section 29-30). Snapshots hold
 * array references, not deep copies — cameraStore/subjectStore always
 * produce new arrays on mutation rather than mutating in place, so this is
 * safe and cheap. Callers are responsible for calling commit() once per
 * logical action (e.g. on drag-start, not on every drag-move frame).
 */
export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],

  commit: () => {
    const snapshot = captureSceneSnapshot()
    set((s) => ({
      past: [...s.past, snapshot].slice(-MAX_HISTORY),
      future: [],
    }))
  },

  undo: () => {
    const { past } = get()
    if (past.length === 0) return
    const previous = past[past.length - 1]
    const currentSnapshot = captureSceneSnapshot()
    set((s) => ({
      past: s.past.slice(0, -1),
      future: [currentSnapshot, ...s.future],
    }))
    applySceneSnapshot(previous)
  },

  redo: () => {
    const { future } = get()
    if (future.length === 0) return
    const next = future[0]
    const currentSnapshot = captureSceneSnapshot()
    set((s) => ({
      past: [...s.past, currentSnapshot],
      future: s.future.slice(1),
    }))
    applySceneSnapshot(next)
  },

  reset: () => set({ past: [], future: [] }),
}))
