import { useEffect, useRef } from 'react'
import { Circle, Group, Rect, Text } from 'react-konva'
import type Konva from 'konva'
import type { CameraInstance } from '../../types/camera'

interface CameraNodeProps {
  camera: CameraInstance
  isSelected: boolean
  onSelect: () => void
  onDragMove: (x: number, y: number) => void
  onRegister: (node: Konva.Group | null) => void
}

export function CameraNode({ camera, isSelected, onSelect, onDragMove, onRegister }: CameraNodeProps) {
  const groupRef = useRef<Konva.Group>(null)

  useEffect(() => {
    onRegister(groupRef.current)
    return () => onRegister(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Group
        ref={groupRef}
        x={camera.x}
        y={camera.y}
        rotation={camera.rotationDeg}
        draggable
        onClick={onSelect}
        onTap={onSelect}
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
