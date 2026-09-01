import { Image as KonvaImage } from 'react-konva'
import type { FloorMapImage } from '../../types/floorMap'

interface FloorMapLayerProps {
  image: FloorMapImage
}

export function FloorMapLayer({ image }: FloorMapLayerProps) {
  return (
    <KonvaImage
      image={image.element}
      width={image.width}
      height={image.height}
      listening={false}
    />
  )
}
