import { saveProject } from './projectPersistence'
import { useCameraStore } from '../state/cameraStore'
import { useDrawingStore } from '../state/drawingStore'
import { useMapStore } from '../state/mapStore'
import { useProjectStore } from '../state/projectStore'
import { useScaleStore } from '../state/scaleStore'
import { useSequenceStore } from '../state/sequenceStore'
import { useSubjectStore } from '../state/subjectStore'

const DEBOUNCE_MS = 800

let timer: ReturnType<typeof setTimeout> | null = null
let initialized = false
/** Set while loadProject() is restoring state, so that restore itself doesn't immediately re-trigger a save. */
let suppressed = false

export function suppressAutosave(suppress: boolean): void {
  suppressed = suppress
}

function scheduleSave() {
  if (suppressed) return
  if (timer) clearTimeout(timer)
  timer = setTimeout(async () => {
    useProjectStore.getState().setSaveStatus('saving')
    try {
      await saveProject()
      useProjectStore.getState().setSaveStatus('saved')
    } catch (err) {
      console.error('Autosave failed:', err)
      useProjectStore.getState().setSaveStatus('error')
    }
  }, DEBOUNCE_MS)
}

/** Wires autosave to fire on any relevant state change. Call once at app startup. */
export function initAutosave(): void {
  if (initialized) return
  initialized = true

  useCameraStore.subscribe(scheduleSave)
  useSubjectStore.subscribe(scheduleSave)
  useDrawingStore.subscribe(scheduleSave)
  useMapStore.subscribe(scheduleSave)
  useScaleStore.subscribe(scheduleSave)
  useSequenceStore.subscribe(scheduleSave)
  useProjectStore.subscribe((state, prevState) => {
    // Excludes saveStatus changes -- otherwise this would re-trigger itself forever.
    if (state.name !== prevState.name) scheduleSave()
  })
}
