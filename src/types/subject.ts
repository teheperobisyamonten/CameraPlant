export type SubjectType = 'person' | 'object'

/** Position is in canvas/image pixel space — same convention as CameraInstance. */
export interface SubjectInstance {
  id: string
  name: string
  type: SubjectType
  x: number
  y: number
  rotationDeg: number
  /** Personal-space radius in meters, drawn as a circle around a 'person'. Null/0 hides it. Not meaningful for 'object'. */
  personalSpaceRadiusM: number | null
}
