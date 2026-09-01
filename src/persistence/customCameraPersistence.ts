import { db } from './db'
import { useCustomCameraStore } from '../state/customCameraStore'
import type { CameraDefinition } from '../types/cameraDefinition'

export async function loadCustomCameras(): Promise<void> {
  const all = await db.customCameras.toArray()
  useCustomCameraStore.getState().setCustomCameras(all)
}

export async function saveCustomCamera(camera: CameraDefinition): Promise<void> {
  await db.customCameras.put(camera)
}

export async function deleteCustomCamera(id: string): Promise<void> {
  await db.customCameras.delete(id)
}
