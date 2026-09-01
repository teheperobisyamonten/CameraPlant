import { create } from 'zustand'
import { useCameraStore } from './cameraStore'
import { useSubjectStore } from './subjectStore'
import type { CameraInstance } from '../types/camera'
import type { SubjectInstance } from '../types/subject'

const MAX_HISTORY = 100

interface Snapshot {
  cameras: CameraInstance[]
  subjects: SubjectInstance[]
}

function captureSnapshot(): Snapshot {
  return {
    cameras: useCameraStore.getState().cameras,
    subjects: useSubjectStore.getState().subjects,
  }
}

function applySnapshot(snapshot: Snapshot) {
  useCameraStore.setState({ cameras: snapshot.cameras })
  useSubjectStore.setState({ subjects: snapshot.subjects })
}

interface HistoryState {
  past: Snapshot[]
  future: Snapshot[]
  /** Call BEFORE a mutation (add/move/rotate/delete/property change) to record one undoable step. */
  commit: () => void
  undo: () => void
  redo: () => void
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
    const snapshot = captureSnapshot()
    set((s) => ({
      past: [...s.past, snapshot].slice(-MAX_HISTORY),
      future: [],
    }))
  },

  undo: () => {
    const { past } = get()
    if (past.length === 0) return
    const previous = past[past.length - 1]
    const currentSnapshot = captureSnapshot()
    set((s) => ({
      past: s.past.slice(0, -1),
      future: [currentSnapshot, ...s.future],
    }))
    applySnapshot(previous)
  },

  redo: () => {
    const { future } = get()
    if (future.length === 0) return
    const next = future[0]
    const currentSnapshot = captureSnapshot()
    set((s) => ({
      past: [...s.past, currentSnapshot],
      future: s.future.slice(1),
    }))
    applySnapshot(next)
  },
}))
