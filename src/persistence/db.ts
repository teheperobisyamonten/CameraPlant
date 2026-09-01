import Dexie, { type Table } from 'dexie'
import type { SceneSnapshot } from '../state/snapshot'
import type { CameraDefinition } from '../types/cameraDefinition'
import type { LensDefinition } from '../types/lensDefinition'

/** v0.1 has a single working project, always stored under CURRENT_PROJECT_ID. */
export interface ProjectRecord {
  id: string
  name: string
  mapBlob: Blob | null
  mapWidth: number | null
  mapHeight: number | null
  pixelsPerMeter: number | null
  sequences: SceneSnapshot[]
  activeSequenceIndex: number
  updatedAt: number
}

export const CURRENT_PROJECT_ID = 'current'

class CameraPlanDB extends Dexie {
  projects!: Table<ProjectRecord, string>
  /** User-added camera models, layered on top of the built-in src/data/cameras.json catalog. */
  customCameras!: Table<CameraDefinition, string>
  /** User-added lens models, layered on top of the built-in src/data/lenses.json catalog. */
  customLenses!: Table<LensDefinition, string>

  constructor() {
    super('CameraPlanDB')
    this.version(1).stores({
      projects: 'id',
    })
    this.version(2).stores({
      projects: 'id',
      customCameras: 'id',
    })
    this.version(3).stores({
      projects: 'id',
      customCameras: 'id',
      customLenses: 'id',
    })
  }
}

export const db = new CameraPlanDB()
