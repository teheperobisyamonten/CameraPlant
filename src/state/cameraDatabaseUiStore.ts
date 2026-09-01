import { create } from 'zustand'

interface CameraDatabaseUiState {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useCameraDatabaseUiStore = create<CameraDatabaseUiState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
