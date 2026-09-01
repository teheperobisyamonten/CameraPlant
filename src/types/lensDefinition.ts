interface LensDefinitionBase {
  id: string
  manufacturer: string
  name: string
  mount: string
  maxAperture: number
  sensorCoverage: string
}

export interface ZoomLensDefinition extends LensDefinitionBase {
  type: 'zoom'
  focalMinMm: number
  focalMaxMm: number
}

export interface PrimeLensDefinition extends LensDefinitionBase {
  type: 'prime'
  focalLengthMm: number
}

/** A real, published lens model in the reference database (src/data/lenses.json). */
export type LensDefinition = ZoomLensDefinition | PrimeLensDefinition
