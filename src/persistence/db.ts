import Dexie, { type Table } from 'dexie'
import type { CameraInstance } from '../types/camera'
import type { SubjectInstance } from '../types/subject'

export interface SceneSnapshotDTO {
  cameras: CameraInstance[]
  subjects: SubjectInstance[]
}

/** v0.1 has a single working project, always stored under CURRENT_PROJECT_ID. */
export interface ProjectRecord {
  id: string
  name: string
  mapBlob: Blob | null
  mapWidth: number | null
  mapHeight: number | null
  pixelsPerMeter: number | null
  sequences: SceneSnapshotDTO[]
  activeSequenceIndex: number
  updatedAt: number
}

export const CURRENT_PROJECT_ID = 'current'

class CameraPlanDB extends Dexie {
  projects!: Table<ProjectRecord, string>

  constructor() {
    super('CameraPlanDB')
    this.version(1).stores({
      projects: 'id',
    })
  }
}

export const db = new CameraPlanDB()
