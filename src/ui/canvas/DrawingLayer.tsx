import { Arrow, Circle, Line, Rect, Text } from 'react-konva'
import { distanceMeters } from '../../geometry/distance'
import { useScaleStore } from '../../state/scaleStore'
import type { DrawingObject, MeasureDrawing } from '../../types/drawing'

interface DrawingLayerProps {
  drawings: DrawingObject[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  /** True while a drawing tool (not Select) is active — shapes stop listening so they don't intercept new-shape clicks. */
  interactive: boolean
}

function MeasureShape({
  drawing,
  isSelected,
  interactive,
  onClick,
}: {
  drawing: MeasureDrawing
  isSelected: boolean
  interactive: boolean
  onClick: () => void
}) {
  const pixelsPerMeter = useScaleStore((s) => s.pixelsPerMeter)
  const [x1, y1, x2, y2] = drawing.points
  const meters = distanceMeters({ x: x1, y: y1 }, { x: x2, y: y2 }, pixelsPerMeter)
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2

  return (
    <>
      <Line
        points={drawing.points}
        stroke={drawing.color}
        strokeWidth={isSelected ? drawing.strokeWidth + 2 : drawing.strokeWidth}
        dash={[6, 4]}
        hitStrokeWidth={Math.max(drawing.strokeWidth, 12)}
        listening={interactive}
        onClick={onClick}
        onTap={onClick}
      />
      <Text
        x={midX - 40}
        y={midY - 16}
        width={80}
        align="center"
        text={meters !== null ? `${meters.toFixed(2)} m` : 'Scale Required'}
        fontSize={12}
        fill={drawing.color}
        listening={false}
      />
    </>
  )
}

export function DrawingLayer({ drawings, selectedId, onSelect, interactive }: DrawingLayerProps) {
  return (
    <>
      {drawings.map((d) => {
        const isSelected = selectedId === d.id
        const handleClick = () => onSelect?.(d.id)
        const strokeWidth = isSelected ? d.strokeWidth + 2 : d.strokeWidth

        switch (d.type) {
          case 'pen':
            return (
              <Line
                key={d.id}
                points={d.points}
                stroke={d.color}
                strokeWidth={strokeWidth}
                lineCap="round"
                lineJoin="round"
                tension={0.3}
                hitStrokeWidth={Math.max(d.strokeWidth, 12)}
                listening={interactive}
                onClick={handleClick}
                onTap={handleClick}
              />
            )
          case 'line':
            return (
              <Line
                key={d.id}
                points={d.points}
                stroke={d.color}
                strokeWidth={strokeWidth}
                hitStrokeWidth={Math.max(d.strokeWidth, 12)}
                listening={interactive}
                onClick={handleClick}
                onTap={handleClick}
              />
            )
          case 'arrow':
            return (
              <Arrow
                key={d.id}
                points={d.points}
                stroke={d.color}
                fill={d.color}
                strokeWidth={strokeWidth}
                pointerLength={10}
                pointerWidth={10}
                hitStrokeWidth={Math.max(d.strokeWidth, 12)}
                listening={interactive}
                onClick={handleClick}
                onTap={handleClick}
              />
            )
          case 'rectangle':
            return (
              <Rect
                key={d.id}
                x={d.x}
                y={d.y}
                width={d.width}
                height={d.height}
                stroke={d.color}
                strokeWidth={strokeWidth}
                listening={interactive}
                onClick={handleClick}
                onTap={handleClick}
              />
            )
          case 'circle':
            return (
              <Circle
                key={d.id}
                x={d.x}
                y={d.y}
                radius={d.radius}
                stroke={d.color}
                strokeWidth={strokeWidth}
                listening={interactive}
                onClick={handleClick}
                onTap={handleClick}
              />
            )
          case 'text':
            return (
              <Text
                key={d.id}
                x={d.x}
                y={d.y}
                text={d.text}
                fontSize={d.fontSize}
                fill={d.color}
                listening={interactive}
                onClick={handleClick}
                onTap={handleClick}
              />
            )
          case 'measure':
            return (
              <MeasureShape
                key={d.id}
                drawing={d}
                isSelected={isSelected}
                interactive={interactive}
                onClick={handleClick}
              />
            )
          default:
            return null
        }
      })}
    </>
  )
}
