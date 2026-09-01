import { create } from 'zustand'

interface EquipmentDatabaseUiState {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useEquipmentDatabaseUiStore = create<EquipmentDatabaseUiState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
