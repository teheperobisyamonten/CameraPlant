import { Circle, Line } from 'react-konva'
import { useScaleStore } from '../../state/scaleStore'

export function ScaleCalibrationLayer() {
  const isCalibrating = useScaleStore((s) => s.isCalibrating)
  const pointA = useScaleStore((s) => s.pointA)
  const pointB = useScaleStore((s) => s.pointB)

  if (!isCalibrating || !pointA) return null

  return (
    <>
      <Circle x={pointA.x} y={pointA.y} radius={6} fill="#4fc3f7" stroke="#ffffff" strokeWidth={1} />
      {pointB && (
        <>
          <Circle
            x={pointB.x}
            y={pointB.y}
            radius={6}
            fill="#4fc3f7"
            stroke="#ffffff"
            strokeWidth={1}
          />
          <Line
            points={[pointA.x, pointA.y, pointB.x, pointB.y]}
            stroke="#4fc3f7"
            strokeWidth={2}
            dash={[8, 4]}
          />
        </>
      )}
    </>
  )
}
