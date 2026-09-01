import { create } from 'zustand'
import { useHistoryStore } from './historyStore'
import { useSelectionStore } from './selectionStore'
import { applySceneSnapshot, captureSceneSnapshot, type SceneSnapshot } from './snapshot'

export const SEQUENCE_COUNT = 10

function emptySnapshot(): SceneSnapshot {
  return { cameras: [], subjects: [], drawings: [] }
}

interface SequenceState {
  /** 0-based; Sequence N (as shown in the UI) is activeIndex N-1. */
  activeIndex: number
  sequences: SceneSnapshot[]
  switchTo: (index: number) => void
  /** Deep-copies the current sequence into the next slot and switches to it. */
  duplicateCurrentToNext: () => void
  /** Empties the current sequence's cameras/subjects/drawings (undoable). */
  clearCurrent: () => void
}

export const useSequenceStore = create<SequenceState>((set, get) => ({
  activeIndex: 0,
  sequences: Array.from({ length: SEQUENCE_COUNT }, emptySnapshot),

  switchTo: (index) => {
    const { activeIndex, sequences } = get()
    if (index === activeIndex || index < 0 || index >= SEQUENCE_COUNT) return

    const updated = [...sequences]
    updated[activeIndex] = captureSceneSnapshot()
    set({ sequences: updated, activeIndex: index })
    applySceneSnapshot(updated[index])
    // Undo history belongs to the sequence being left; carrying it across
    // a switch would let Undo corrupt a different sequence's state.
    useHistoryStore.getState().reset()
    useSelectionStore.getState().select(null)
  },

  duplicateCurrentToNext: () => {
    const { activeIndex, sequences } = get()
    const nextIndex = activeIndex + 1
    if (nextIndex >= SEQUENCE_COUNT) return

    const current = captureSceneSnapshot()
    const duplicated: SceneSnapshot = {
      cameras: current.cameras.map((camera) => ({ ...camera })),
      subjects: current.subjects.map((subject) => ({ ...subject })),
      drawings: current.drawings.map((drawing) => ({ ...drawing })),
    }

    const updated = [...sequences]
    updated[activeIndex] = current
    updated[nextIndex] = duplicated
    set({ sequences: updated, activeIndex: nextIndex })
    applySceneSnapshot(duplicated)
    useHistoryStore.getState().reset()
    useSelectionStore.getState().select(null)
  },

  clearCurrent: () => {
    useHistoryStore.getState().commit()
    applySceneSnapshot(emptySnapshot())
    useSelectionStore.getState().select(null)
  },
}))
