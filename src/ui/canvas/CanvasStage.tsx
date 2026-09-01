import { useCallback, useEffect, useRef, useState } from 'react'
import { Stage, Layer } from 'react-konva'
import type Konva from 'konva'
import { useMapStore } from '../../state/mapStore'
import { MAX_SCALE, MIN_SCALE, useViewportStore } from '../../state/viewportStore'
import { FloorMapLayer } from './FloorMapLayer'

const ZOOM_STEP = 1.05
const FIT_PADDING = 40

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

  const isSpaceDown = useRef(false)
  const isPanning = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') isSpaceDown.current = true
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
  }, [])

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
    }
  }

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isPanning.current) return
    const dx = e.evt.clientX - lastPointer.current.x
    const dy = e.evt.clientY - lastPointer.current.y
    lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY }
    setTransform({ x: x + dx, y: y + dy })
  }

  const stopPanning = () => {
    isPanning.current = false
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
          onMouseUp={stopPanning}
          onMouseLeave={stopPanning}
        >
          <Layer>
            <FloorMapLayer image={image} />
          </Layer>
        </Stage>
      )}
    </div>
  )
}
