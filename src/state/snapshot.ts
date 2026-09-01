import { useCameraStore } from './cameraStore'
import { useDrawingStore } from './drawingStore'
import { useSubjectStore } from './subjectStore'
import type { CameraInstance } from '../types/camera'
import type { DrawingObject } from '../types/drawing'
import type { SubjectInstance } from '../types/subject'

/** The part of the live scene that Undo/Redo and Sequences both snapshot. */
export interface SceneSnapshot {
  cameras: CameraInstance[]
  subjects: SubjectInstance[]
  drawings: DrawingObject[]
}

export function captureSceneSnapshot(): SceneSnapshot {
  return {
    cameras: useCameraStore.getState().cameras,
    subjects: useSubjectStore.getState().subjects,
    drawings: useDrawingStore.getState().drawings,
  }
}

export function applySceneSnapshot(snapshot: SceneSnapshot) {
  useCameraStore.setState({ cameras: snapshot.cameras })
  useSubjectStore.setState({ subjects: snapshot.subjects })
  useDrawingStore.setState({ drawings: snapshot.drawings })
}
