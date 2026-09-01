/** A real, published camera model in the reference database (src/data/cameras.json). */
export interface CameraDefinition {
  id: string
  manufacturer: string
  model: string
  mount: string
  sensorType: string
  sensorWidthMm: number
  sensorHeightMm: number
}
