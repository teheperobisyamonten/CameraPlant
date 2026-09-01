import { create } from 'zustand'

interface ExportUiState {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useExportUiStore = create<ExportUiState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
