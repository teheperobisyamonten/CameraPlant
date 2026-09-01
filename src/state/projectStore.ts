import { create } from 'zustand'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface ProjectState {
  name: string
  saveStatus: SaveStatus
  setName: (name: string) => void
  setSaveStatus: (status: SaveStatus) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  name: 'Untitled Project',
  saveStatus: 'idle',
  setName: (name) => set({ name }),
  setSaveStatus: (status) => set({ saveStatus: status }),
}))
