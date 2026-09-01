import type Konva from 'konva'

/**
 * Shared, non-reactive handles to the live Konva Stage/Transformer, set by
 * CanvasStage. Lets Export (which renders outside the canvas tree) reach the
 * Stage without prop-drilling or React context.
 */
export const canvasRefs: {
  stage: Konva.Stage | null
  transformer: Konva.Transformer | null
} = {
  stage: null,
  transformer: null,
}
