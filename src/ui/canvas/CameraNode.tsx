import { useEffect, useRef } from 'react'
import { Arc, Circle, Group, Rect, Text, Wedge } from 'react-konva'
import type Konva from 'konva'
import type { FovResult } from '../../geometry/fov'
import type { CameraInstance } from '../../types/camera'

/** Depth-of-field near/far band to render, already converted to canvas px. */
export interface DofBandPx {
  nearPx: number
  farPx: number
}

interface CameraNodeProps {
  camera: CameraInstance
  isSelected: boolean
  fov: FovResult | null
  fovRangePx: number
  dofBandPx: DofBandPx | null
  /** Icon scale factor so the drawn camera size reflects real-world size once Scale is calibrated. */
  sizeScale: number
  onSelect: () => void
  onDragStart: () => void
  onDragMove: (x: number, y: number) => void
  onRegister: (node: Konva.Group | null) => void
}

export function CameraNode({
  camera,
  isSelected,
  fov,
  fovRangePx,
  dofBandPx,
  sizeScale,
  onSelect,
  onDragStart,
  onDragMove,
  onRegister,
}: CameraNodeProps) {
  const groupRef = useRef<Konva.Group>(null)

  useEffect(() => {
    onRegister(groupRef.current)
    return () => onRegister(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {fov && (
        <Wedge
          x={camera.x}
          y={camera.y}
          radius={fovRangePx}
          angle={fov.horizontalDeg}
          rotation={camera.rotationDeg - fov.horizontalDeg / 2}
          fill="rgba(79, 195, 247, 0.18)"
          stroke="rgba(79, 195, 247, 0.55)"
          strokeWidth={1}
          listening={false}
        />
      )}
      {fov && dofBandPx && (
        <Arc
          x={camera.x}
          y={camera.y}
          innerRadius={dofBandPx.nearPx}
          outerRadius={dofBandPx.farPx}
          angle={fov.horizontalDeg}
          rotation={camera.rotationDeg - fov.horizontalDeg / 2}
          fill="rgba(120, 220, 140, 0.28)"
          stroke="rgba(120, 220, 140, 0.6)"
          strokeWidth={1}
          listening={false}
        />
      )}
      <Group
        ref={groupRef}
        x={camera.x}
        y={camera.y}
        rotation={camera.rotationDeg}
        scaleX={sizeScale}
        scaleY={sizeScale}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragStart={onDragStart}
        onDragMove={(e) => onDragMove(e.target.x(), e.target.y())}
        onDragEnd={(e) => onDragMove(e.target.x(), e.target.y())}
      >
        {/* facing barrel: points along local +x, i.e. rotationDeg=0 faces right */}
        <Rect x={4} y={-3} width={16} height={6} fill="#4fc3f7" cornerRadius={2} />
        {/* body */}
        <Rect
          x={-14}
          y={-10}
          width={20}
          height={20}
          fill="#2d2d30"
          stroke={isSelected ? '#4fc3f7' : '#8a8a8a'}
          strokeWidth={isSelected ? 2 : 1}
          cornerRadius={4}
        />
        <Circle x={-4} y={0} radius={5} fill="#4fc3f7" />
      </Group>
      {/* label rendered unrotated so it stays legible regardless of camera facing */}
      <Text
        text={camera.name}
        x={camera.x - 50}
        y={camera.y + 16}
        width={100}
        align="center"
        fontSize={12}
        fill="#d4d4d4"
        listening={false}
      />
    </>
  )
}
