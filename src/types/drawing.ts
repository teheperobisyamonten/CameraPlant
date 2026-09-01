interface DrawingBase {
  id: string
  color: string
  strokeWidth: number
}

export interface PenDrawing extends DrawingBase {
  type: 'pen'
  /** Flat [x1, y1, x2, y2, ...] in canvas/image pixel space. */
  points: number[]
}

export interface LineDrawing extends DrawingBase {
  type: 'line'
  points: [number, number, number, number]
}

export interface ArrowDrawing extends DrawingBase {
  type: 'arrow'
  points: [number, number, number, number]
}

export interface RectangleDrawing extends DrawingBase {
  type: 'rectangle'
  x: number
  y: number
  width: number
  height: number
}

export interface CircleDrawing extends DrawingBase {
  type: 'circle'
  x: number
  y: number
  radius: number
}

export interface TextDrawing extends DrawingBase {
  type: 'text'
  x: number
  y: number
  text: string
  fontSize: number
}

export interface MeasureDrawing extends DrawingBase {
  type: 'measure'
  points: [number, number, number, number]
}

export type DrawingObject =
  | PenDrawing
  | LineDrawing
  | ArrowDrawing
  | RectangleDrawing
  | CircleDrawing
  | TextDrawing
  | MeasureDrawing
