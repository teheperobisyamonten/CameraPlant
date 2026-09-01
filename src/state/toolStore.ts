import { create } from 'zustand'

export type ToolMode =
  | 'select'
  | 'pen'
  | 'line'
  | 'arrow'
  | 'rectangle'
  | 'circle'
  | 'text'
  | 'eraser'
  | 'measure'

interface ToolState {
  activeTool: ToolMode
  color: string
  strokeWidth: number
  setActiveTool: (tool: ToolMode) => void
  setColor: (color: string) => void
  setStrokeWidth: (width: number) => void
}

export const useToolStore = create<ToolState>((set) => ({
  activeTool: 'select',
  color: '#f5c542',
  strokeWidth: 2,
  setActiveTool: (tool) => set({ activeTool: tool }),
  setColor: (color) => set({ color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
}))
