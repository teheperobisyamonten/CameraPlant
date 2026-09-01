import { useCallback, useEffect, useRef, useState } from 'react'
import { Stage, Layer, Transformer } from 'react-konva'
import type Konva from 'konva'
import { useCameraStore } from '../../state/cameraStore'
import { useMapStore } from '../../state/mapStore'
import { useScaleStore } from '../../state/scaleStore'
import { useSelectionStore } from '../../state/selectionStore'
import { MAX_SCALE, MIN_SCALE, useViewportStore } from '../../state/viewportStore'
import { CameraNode } from './CameraNode'
import { FloorMapLayer } from './FloorMapLayer'
import { ScaleCalibrationLayer } from './ScaleCalibrationLayer'
import { ScaleCalibrationPanel } from './ScaleCalibrationPanel'

const ZOOM_STEP = 1.05
const FIT_PADDING = 40
/** Pointer movement (px) below which a mousedown/mouseup pair counts as a click, not a drag. */
const CLICK_MOVE_THRESHOLD = 5

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

  const cameras = useCameraStore((s) => s.cameras)
  const updateCamera = useCameraStore((s) => s.updateCamera)
  const removeCamera = useCameraStore((s) => s.removeCamera)

  const selected = useSelectionStore((s) => s.selected)
  const select = useSelectionStore((s) => s.select)

  const isSpaceDown = useRef(false)
  const isPanning = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })
  const clickStart = useRef<{ x: number; y: number } | null>(null)

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
    const node = selected?.kind === 'camera' ? shapeRefs.current.get(selected.id) : undefined
    transformer.nodes(node ? [node] : [])
    transformer.getLayer()?.batchDraw()
  }, [selected, cameras])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') isSpaceDown.current = true
      if (e.code === 'Escape' && isCalibrating) cancelCalibration()

      const isDeleteKey =
        e.code === 'Delete' || e.code === 'Backspace' || e.key === 'Delete' || e.key === 'Backspace'
      if (isDeleteKey && selected) {
        if (isEditableElement(document.activeElement)) return
        e.preventDefault()
        if (selected.kind === 'camera') {
          removeCamera(selected.id)
          select(null)
        }
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
  }, [isCalibrating, cancelCalibration, selected, removeCamera, select])

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

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const isMiddleButton = e.evt.button === 1
    if (isMiddleButton || isSpaceDown.current) {
      e.evt.preventDefault()
      isPanning.current = true
      lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY }
      return
    }
    if (e.evt.button === 0) {
      clickStart.current = { x: e.evt.clientX, y: e.evt.clientY }
    }
  }

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isPanning.current) return
    const dx = e.evt.clientX - lastPointer.current.x
    const dy = e.evt.clientY - lastPointer.current.y
    lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY }
    setTransform({ x: x + dx, y: y + dy })
  }

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanning.current) {
      isPanning.current = false
      clickStart.current = null
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
            {cameras.map((camera) => (
              <CameraNode
                key={camera.id}
                camera={camera}
                isSelected={selected?.kind === 'camera' && selected.id === camera.id}
                onSelect={() => select({ kind: 'camera', id: camera.id })}
                onDragMove={(nx, ny) => updateCamera(camera.id, { x: nx, y: ny })}
                onRegister={(node) => {
                  if (node) shapeRefs.current.set(camera.id, node)
                  else shapeRefs.current.delete(camera.id)
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
              onTransform={() => {
                const node = transformerRef.current?.nodes()[0]
                if (node && selected?.kind === 'camera') {
                  updateCamera(selected.id, { rotationDeg: node.rotation() })
                }
              }}
              onTransformEnd={() => {
                const node = transformerRef.current?.nodes()[0]
                if (node && selected?.kind === 'camera') {
                  updateCamera(selected.id, { rotationDeg: node.rotation() })
                }
              }}
            />
          </Layer>
        </Stage>
      )}
    </div>
  )
}
