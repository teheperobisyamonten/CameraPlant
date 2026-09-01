import { useCameraStore } from './cameraStore'
import { useSubjectStore } from './subjectStore'
import type { CameraInstance } from '../types/camera'
import type { SubjectInstance } from '../types/subject'

/** The part of the live scene that Undo/Redo and Sequences both snapshot. */
export interface SceneSnapshot {
  cameras: CameraInstance[]
  subjects: SubjectInstance[]
}

export function captureSceneSnapshot(): SceneSnapshot {
  return {
    cameras: useCameraStore.getState().cameras,
    subjects: useSubjectStore.getState().subjects,
  }
}

export function applySceneSnapshot(snapshot: SceneSnapshot) {
  useCameraStore.setState({ cameras: snapshot.cameras })
  useSubjectStore.setState({ subjects: snapshot.subjects })
}
