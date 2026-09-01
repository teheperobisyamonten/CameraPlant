import { create } from 'zustand'

export type SelectableKind = 'camera' | 'subject' | 'drawing'

export interface Selection {
  kind: SelectableKind
  id: string
}

interface SelectionState {
  selected: Selection | null
  select: (selection: Selection | null) => void
}

/**
 * Single, unified selection state for every canvas object type (Camera,
 * Subject, Drawing). Components must not keep their own local "selected"
 * state — see Camera Plan spec Section 26.
 */
export const useSelectionStore = create<SelectionState>((set) => ({
  selected: null,
  select: (selection) => set({ selected: selection }),
}))
