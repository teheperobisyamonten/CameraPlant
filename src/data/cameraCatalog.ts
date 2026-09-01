import { useMemo } from 'react'
import CAMERAS from './cameras.json'
import { useCustomCameraStore } from '../state/customCameraStore'
import type { CameraDefinition } from '../types/cameraDefinition'

export const BUILTIN_CAMERA_DEFINITIONS = CAMERAS as CameraDefinition[]

/** Reactive built-in + user-added camera list, for components that render a selection list. */
export function useCameraDefinitions(): CameraDefinition[] {
  const custom = useCustomCameraStore((s) => s.customCameras)
  return useMemo(() => [...BUILTIN_CAMERA_DEFINITIONS, ...custom], [custom])
}

/** Non-reactive snapshot, for plain functions (not components) that just need a one-off lookup. */
export function getCameraDefinitionsSnapshot(): CameraDefinition[] {
  return [...BUILTIN_CAMERA_DEFINITIONS, ...useCustomCameraStore.getState().customCameras]
}
