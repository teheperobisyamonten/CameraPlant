import { useEffect, useRef } from 'react'
import { Circle, Group, Rect, Text } from 'react-konva'
import type Konva from 'konva'
import type { SubjectInstance } from '../../types/subject'

interface SubjectNodeProps {
  subject: SubjectInstance
  isSelected: boolean
  /** Personal-space circle radius in canvas px, or null to hide it (non-person, or radius 0). */
  personalSpaceRadiusPx: number | null
  /** Icon scale factor so the drawn subject size reflects real-world size once Scale is calibrated. */
  sizeScale: number
  onSelect: () => void
  onDragStart: () => void
  onDragMove: (x: number, y: number) => void
  onRegister: (node: Konva.Group | null) => void
}

export function SubjectNode({
  subject,
  isSelected,
  personalSpaceRadiusPx,
  sizeScale,
  onSelect,
  onDragStart,
  onDragMove,
  onRegister,
}: SubjectNodeProps) {
  const groupRef = useRef<Konva.Group>(null)

  useEffect(() => {
    onRegister(groupRef.current)
    return () => onRegister(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const strokeColor = isSelected ? '#4fc3f7' : '#8a8a8a'
  const strokeWidth = isSelected ? 2 : 1

  return (
    <>
      {subject.type === 'person' && personalSpaceRadiusPx && personalSpaceRadiusPx > 0 && (
        <Circle
          x={subject.x}
          y={subject.y}
          radius={personalSpaceRadiusPx}
          fill="rgba(224, 164, 88, 0.14)"
          stroke="rgba(224, 164, 88, 0.5)"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      )}
      <Group
        ref={groupRef}
        x={subject.x}
        y={subject.y}
        rotation={subject.rotationDeg}
        scaleX={sizeScale}
        scaleY={sizeScale}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragStart={onDragStart}
        onDragMove={(e) => onDragMove(e.target.x(), e.target.y())}
        onDragEnd={(e) => onDragMove(e.target.x(), e.target.y())}
      >
        {subject.type === 'person' ? (
          <>
            <Circle x={0} y={-9} radius={5} fill="#e0a458" stroke={strokeColor} strokeWidth={strokeWidth} />
            <Rect
              x={-6}
              y={-3}
              width={12}
              height={14}
              cornerRadius={3}
              fill="#e0a458"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* facing indicator */}
            <Rect x={4} y={2} width={10} height={3} fill={strokeColor} cornerRadius={1.5} />
          </>
        ) : (
          <>
            <Rect
              x={-10}
              y={-10}
              width={20}
              height={20}
              fill="#8a6fd4"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              cornerRadius={2}
            />
            <Rect x={4} y={-2} width={10} height={4} fill={strokeColor} cornerRadius={1.5} />
          </>
        )}
      </Group>
      <Text
        text={subject.name}
        x={subject.x - 50}
        y={subject.y + 16}
        width={100}
        align="center"
        fontSize={12}
        fill="#d4d4d4"
        listening={false}
      />
    </>
  )
}
