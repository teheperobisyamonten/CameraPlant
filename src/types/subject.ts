export type SubjectType = 'person' | 'object'

/** Position is in canvas/image pixel space — same convention as CameraInstance. */
export interface SubjectInstance {
  id: string
  name: string
  type: SubjectType
  x: number
  y: number
  rotationDeg: number
}
