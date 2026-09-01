import { useCallback, useEffect, useRef, useState } from 'react'
import { Stage, Layer, Transformer } from 'react-konva'
import type Konva from 'konva'
import { resolveCameraFov } from '../../data/resolveFov'
import { hitTestDrawing } from '../../geometry/drawing'
import { metersToPixels } from '../../geometry/scale'
import { useCameraStore } from '../../state/cameraStore'
import { useDrawingStore } from '../../state/drawingStore'
import { useHistoryStore } from '../../state/historyStore'
import { useMapStore } from '../../state/mapStore'
import { useScaleStore } from '../../state/scaleStore'
import { useSelectionStore } from '../../state/selectionStore'
import { useSubjectStore } from '../../state/subjectStore'
import { useToolStore } from '../../state/toolStore'
import { MAX_SCALE, MIN_SCALE, useViewportStore } from '../../state/viewportStore'
import type { DrawingObject } from '../../types/drawing'
import { buildDrawingFromDrag } from './buildDrawing'
import { CameraNode } from './CameraNode'
import { DrawingLayer } from './DrawingLayer'
import { FloorMapLayer } from './FloorMapLayer'
import { ScaleCalibrationLayer } from './ScaleCalibrationLayer'
import { ScaleCalibrationPanel } from './ScaleCalibrationPanel'
import { SubjectNode } from './SubjectNode'
import { TextToolPanel } from './TextToolPanel'

const ZOOM_STEP = 1.05
const FIT_PADDING = 40
/** Pointer movement (px) below which a mousedown/mouseup pair counts as a click, not a drag. */
const CLICK_MOVE_THRESHOLD = 5
/** How far the FOV wedge is drawn: a real-world preview distance once Scale is set, else a fixed fallback. */
const FOV_PREVIEW_METERS = 5
const FOV_PREVIEW_FALLBACK_PX = 220
const ERASE_TOLERANCE_PX = 8
const DEFAULT_TEXT_FONT_SIZE = 16

function isEditableElement(el: Element | null): boolean {
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || (el as HTMLElement).isContentEditable
}

export function CanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  const image = useMapStore((s) => s.image)
  const error = useMapStore((s) => s.error)
  const clearError = useMapStore((s) => s.clearError)

  const scale = useViewportStore((s) => s.scale)
  const x = useViewportStore((s) => s.x)
  const y = useViewportStore((s) => s.y)
  const resetToken = useViewportStore((s) => s.resetToken)
  const setTransform = useViewportStore((s) => s.setTransform)

  const isCalibrating = useScaleStore((s) => s.isCalibrating)
  const addCalibrationPoint = useScaleStore((s) => s.addPoint)
  const cancelCalibration = useScaleStore((s) => s.cancelCalibration)
  const pixelsPerMeter = useScaleStore((s) => s.pixelsPerMeter)

  const cameras = useCameraStore((s) => s.cameras)
  const updateCamera = useCameraStore((s) => s.updateCamera)
  const removeCamera = useCameraStore((s) => s.removeCamera)

  const subjects = useSubjectStore((s) => s.subjects)
  const updateSubject = useSubjectStore((s) => s.updateSubject)
  const removeSubject = useSubjectStore((s) => s.removeSubject)

  const drawings = useDrawingStore((s) => s.drawings)
  const addDrawing = useDrawingStore((s) => s.addDrawing)
  const removeDrawing = useDrawingStore((s) => s.removeDrawing)

  const activeTool = useToolStore((s) => s.activeTool)
  const setActiveTool = useToolStore((s) => s.setActiveTool)
  const toolColor = useToolStore((s) => s.color)
  const toolStrokeWidth = useToolStore((s) => s.strokeWidth)

  const fovRangePx = pixelsPerMeter
    ? metersToPixels(FOV_PREVIEW_METERS, pixelsPerMeter)
    : FOV_PREVIEW_FALLBACK_PX

  const selected = useSelectionStore((s) => s.selected)
  const select = useSelectionStore((s) => s.select)

  const isSpaceDown = useRef(false)
  const isPanning = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })
  const clickStart = useRef<{ x: number; y: number } | null>(null)

  const isDrawingGesture = useRef(false)
  const isErasing = useRef(false)
  const drawStart = useRef<{ x: number; y: number } | null>(null)
  const penPoints = useRef<number[]>([])
  const [previewDrawing, setPreviewDrawing] = useState<DrawingObject | null>(null)
  const [textPromptPoint, setTextPromptPoint] = useState<{ x: number; y: number } | null>(null)

  const shapeRefs = useRef(new Map<string, Konva.Group>())
  const transformerRef = useRef<Konva.Transformer>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const fitToView = useCallback(() => {
    if (!image || size.width === 0 || size.height === 0) return
    const availableWidth = Math.max(size.width - FIT_PADDING, 1)
    const availableHeight = Math.max(size.height - FIT_PADDING, 1)
    const fitScale = Math.min(availableWidth / image.width, availableHeight / image.height, 1)
    const nextScale = Number.isFinite(fitScale) && fitScale > 0 ? fitScale : 1
    setTransform({
      scale: nextScale,
      x: (size.width - image.width * nextScale) / 2,
      y: (size.height - image.height * nextScale) / 2,
    })
  }, [image, size, setTransform])

  useEffect(() => {
    fitToView()
  }, [fitToView, resetToken])

  useEffect(() => {
    const transformer = transformerRef.current
    if (!transformer) return
    const node = selected ? shapeRefs.current.get(selected.id) : undefined
    transformer.nodes(node ? [node] : [])
    transformer.getLayer()?.batchDraw()
  }, [selected, cameras, subjects])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') isSpaceDown.current = true
      if (e.code === 'Escape') {
        if (isCalibrating) cancelCalibration()
        if (textPromptPoint) setTextPromptPoint(null)
        setActiveTool('select')
      }

      const isDeleteKey =
        e.code === 'Delete' || e.code === 'Backspace' || e.key === 'Delete' || e.key === 'Backspace'
      if (isDeleteKey && selected) {
        if (isEditableElement(document.activeElement)) return
        e.preventDefault()
        useHistoryStore.getState().commit()
        if (selected.kind === 'camera') {
          removeCamera(selected.id)
        } else if (selected.kind === 'subject') {
          removeSubject(selected.id)
        } else {
          removeDrawing(selected.id)
        }
        select(null)
        return
      }

      if (isEditableElement(document.activeElement)) return

      const isUndo = (e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z'
      const isRedo =
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y')
      if (isUndo) {
        e.preventDefault()
        useHistoryStore.getState().undo()
      } else if (isRedo) {
        e.preventDefault()
        useHistoryStore.getState().redo()
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') isSpaceDown.current = false
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [
    isCalibrating,
    cancelCalibration,
    selected,
    removeCamera,
    removeSubject,
    removeDrawing,
    select,
    textPromptPoint,
    setActiveTool,
  ])

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = e.target.getStage()
    const pointer = stage?.getPointerPosition()
    if (!stage || !pointer) return

    const direction = e.evt.deltaY > 0 ? -1 : 1
    let nextScale = direction > 0 ? scale * ZOOM_STEP : scale / ZOOM_STEP
    nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale))

    const mapPoint = {
      x: (pointer.x - x) / scale,
      y: (pointer.y - y) / scale,
    }

    setTransform({
      scale: nextScale,
      x: pointer.x - mapPoint.x * nextScale,
      y: pointer.y - mapPoint.y * nextScale,
    })
  }

  const getImagePoint = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    const pointer = stage?.getPointerPosition()
    if (!stage || !pointer) return null
    return { x: (pointer.x - x) / scale, y: (pointer.y - y) / scale }
  }

  const eraseAt = (point: { x: number; y: number }) => {
    const hit = drawings.find((d) => hitTestDrawing(point, d, ERASE_TOLERANCE_PX))
    if (hit) {
      useHistoryStore.getState().commit()
      removeDrawing(hit.id)
    }
  }

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const isMiddleButton = e.evt.button === 1
    if (isMiddleButton || isSpaceDown.current) {
      e.evt.preventDefault()
      isPanning.current = true
      lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY }
      return
    }
    if (e.evt.button !== 0) return

    if (activeTool !== 'select' && !isCalibrating) {
      const point = getImagePoint(e)
      if (!point) return

      if (activeTool === 'text') {
        setTextPromptPoint(point)
        return
      }
      if (activeTool === 'eraser') {
        isErasing.current = true
        eraseAt(point)
        return
      }
      if (activeTool === 'pen') {
        isDrawingGesture.current = true
        penPoints.current = [point.x, point.y]
        setPreviewDrawing({
          id: 'preview',
          type: 'pen',
          points: [...penPoints.current],
          color: toolColor,
          strokeWidth: toolStrokeWidth,
        })
        return
      }
      // line / arrow / rectangle / circle / measure
      isDrawingGesture.current = true
      drawStart.current = point
      return
    }

    clickStart.current = { x: e.evt.clientX, y: e.evt.clientY }
  }

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanning.current) {
      const dx = e.evt.clientX - lastPointer.current.x
      const dy = e.evt.clientY - lastPointer.current.y
      lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY }
      setTransform({ x: x + dx, y: y + dy })
      return
    }

    if (isErasing.current) {
      const point = getImagePoint(e)
      if (point) eraseAt(point)
      return
    }

    if (isDrawingGesture.current) {
      const point = getImagePoint(e)
      if (!point) return
      if (activeTool === 'pen') {
        penPoints.current.push(point.x, point.y)
        setPreviewDrawing({
          id: 'preview',
          type: 'pen',
          points: [...penPoints.current],
          color: toolColor,
          strokeWidth: toolStrokeWidth,
        })
      } else if (drawStart.current) {
        setPreviewDrawing(
          buildDrawingFromDrag(activeTool, drawStart.current, point, toolColor, toolStrokeWidth),
        )
      }
    }
  }

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanning.current) {
      isPanning.current = false
      clickStart.current = null
      return
    }

    if (isErasing.current) {
      isErasing.current = false
      return
    }

    if (isDrawingGesture.current) {
      isDrawingGesture.current = false
      let finalDrawing: DrawingObject | null = null

      if (activeTool === 'pen') {
        if (penPoints.current.length >= 4) {
          finalDrawing = {
            id: crypto.randomUUID(),
            type: 'pen',
            points: [...penPoints.current],
            color: toolColor,
            strokeWidth: toolStrokeWidth,
          }
        }
        penPoints.current = []
      } else if (drawStart.current) {
        const point = getImagePoint(e)
        if (point) {
          finalDrawing = buildDrawingFromDrag(
            activeTool,
            drawStart.current,
            point,
            toolColor,
            toolStrokeWidth,
          )
        }
        drawStart.current = null
      }

      setPreviewDrawing(null)
      if (finalDrawing) {
        useHistoryStore.getState().commit()
        addDrawing(finalDrawing)
      }
      return
    }

    const start = clickStart.current
    clickStart.current = null
    if (!start) return

    const moved = Math.hypot(e.evt.clientX - start.x, e.evt.clientY - start.y)
    if (moved > CLICK_MOVE_THRESHOLD) return

    const stage = e.target.getStage()
    const pointer = stage?.getPointerPosition()
    if (!stage || !pointer) return

    const imagePoint = {
      x: (pointer.x - x) / scale,
      y: (pointer.y - y) / scale,
    }

    if (isCalibrating) {
      addCalibrationPoint(imagePoint)
      return
    }

    // Clicked empty canvas background (not a shape) -> deselect.
    if (e.target === stage) {
      select(null)
    }
  }

  const handleMouseLeave = () => {
    isPanning.current = false
    clickStart.current = null
  }

  const handleTextConfirm = (text: string) => {
    if (!textPromptPoint) return
    useHistoryStore.getState().commit()
    addDrawing({
      id: crypto.randomUUID(),
      type: 'text',
      x: textPromptPoint.x,
      y: textPromptPoint.y,
      text,
      fontSize: DEFAULT_TEXT_FONT_SIZE,
      color: toolColor,
      strokeWidth: toolStrokeWidth,
    })
    setTextPromptPoint(null)
  }

  return (
    <div className="canvas-area" ref={containerRef}>
      {error && (
        <div className="canvas-area__error">
          <span>{error}</span>
          <button type="button" onClick={clearError}>
            Dismiss
          </button>
        </div>
      )}

      {!image && !error && (
        <p className="canvas-area__placeholder">
          Floor Map will appear here.
          <br />
          Project → Map → Load Floor Map
        </p>
      )}

      <ScaleCalibrationPanel />
      {textPromptPoint && (
        <TextToolPanel onConfirm={handleTextConfirm} onCancel={() => setTextPromptPoint(null)} />
      )}

      {image && size.width > 0 && size.height > 0 && (
        <Stage
          width={size.width}
          height={size.height}
          scaleX={scale}
          scaleY={scale}
          x={x}
          y={y}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <Layer>
            <FloorMapLayer image={image} />
            <ScaleCalibrationLayer />
            <DrawingLayer
              drawings={drawings}
              selectedId={selected?.kind === 'drawing' ? selected.id : null}
              onSelect={(id) => select({ kind: 'drawing', id })}
              interactive={activeTool === 'select'}
            />
            {previewDrawing && (
              <DrawingLayer drawings={[previewDrawing]} interactive={false} />
            )}
            {cameras.map((camera) => (
              <CameraNode
                key={camera.id}
                camera={camera}
                isSelected={selected?.kind === 'camera' && selected.id === camera.id}
                fov={resolveCameraFov(camera)}
                fovRangePx={fovRangePx}
                onSelect={() => select({ kind: 'camera', id: camera.id })}
                onDragStart={() => useHistoryStore.getState().commit()}
                onDragMove={(nx, ny) => updateCamera(camera.id, { x: nx, y: ny })}
                onRegister={(node) => {
                  if (node) shapeRefs.current.set(camera.id, node)
                  else shapeRefs.current.delete(camera.id)
                }}
              />
            ))}
            {subjects.map((subject) => (
              <SubjectNode
                key={subject.id}
                subject={subject}
                isSelected={selected?.kind === 'subject' && selected.id === subject.id}
                onSelect={() => select({ kind: 'subject', id: subject.id })}
                onDragStart={() => useHistoryStore.getState().commit()}
                onDragMove={(nx, ny) => updateSubject(subject.id, { x: nx, y: ny })}
                onRegister={(node) => {
                  if (node) shapeRefs.current.set(subject.id, node)
                  else shapeRefs.current.delete(subject.id)
                }}
              />
            ))}
            <Transformer
              ref={transformerRef}
              rotateEnabled
              resizeEnabled={false}
              borderStroke="#4fc3f7"
              anchorStroke="#4fc3f7"
              anchorFill="#1e1e1e"
              onTransformStart={() => useHistoryStore.getState().commit()}
              onTransform={() => {
                const node = transformerRef.current?.nodes()[0]
                if (!node || !selected) return
                if (selected.kind === 'camera') {
                  updateCamera(selected.id, { rotationDeg: node.rotation() })
                } else if (selected.kind === 'subject') {
                  updateSubject(selected.id, { rotationDeg: node.rotation() })
                }
              }}
              onTransformEnd={() => {
                const node = transformerRef.current?.nodes()[0]
                if (!node || !selected) return
                if (selected.kind === 'camera') {
                  updateCamera(selected.id, { rotationDeg: node.rotation() })
                } else if (selected.kind === 'subject') {
                  updateSubject(selected.id, { rotationDeg: node.rotation() })
                }
              }}
            />
          </Layer>
        </Stage>
      )}
    </div>
  )
}
