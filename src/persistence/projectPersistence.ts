import { suppressAutosave } from './autosave'
import { CURRENT_PROJECT_ID, db, type ProjectRecord } from './db'
import { useCameraStore } from '../state/cameraStore'
import { useMapStore } from '../state/mapStore'
import { useProjectStore } from '../state/projectStore'
import { useScaleStore } from '../state/scaleStore'
import { useSequenceStore } from '../state/sequenceStore'
import { useSubjectStore } from '../state/subjectStore'
import { captureSceneSnapshot } from '../state/snapshot'

export async function saveProject(): Promise<void> {
  const mapImage = useMapStore.getState().image
  const scaleState = useScaleStore.getState()
  const sequenceState = useSequenceStore.getState()
  const projectName = useProjectStore.getState().name

  // The active sequence slot only gets synced to live state on switch/duplicate,
  // so refresh it here to make sure in-progress edits aren't lost on save.
  const sequences = [...sequenceState.sequences]
  sequences[sequenceState.activeIndex] = captureSceneSnapshot()

  const record: ProjectRecord = {
    id: CURRENT_PROJECT_ID,
    name: projectName,
    mapBlob: mapImage?.blob ?? null,
    mapWidth: mapImage?.width ?? null,
    mapHeight: mapImage?.height ?? null,
    pixelsPerMeter: scaleState.pixelsPerMeter,
    sequences,
    activeSequenceIndex: sequenceState.activeIndex,
    updatedAt: Date.now(),
  }

  await db.projects.put(record)
}

/** Returns true if a saved project was found and restored. */
export async function loadProject(): Promise<boolean> {
  const record: ProjectRecord | undefined = await db.projects.get(CURRENT_PROJECT_ID)
  if (!record) return false

  suppressAutosave(true)
  try {
    useProjectStore.getState().setName(record.name)

    if (record.mapBlob) {
      await useMapStore.getState().loadFromBlob(record.mapBlob)
    }

    useScaleStore.setState({ pixelsPerMeter: record.pixelsPerMeter })

    useSequenceStore.setState({
      sequences: record.sequences,
      activeIndex: record.activeSequenceIndex,
    })

    const activeScene = record.sequences[record.activeSequenceIndex]
    if (activeScene) {
      useCameraStore.setState({ cameras: activeScene.cameras })
      useSubjectStore.setState({ subjects: activeScene.subjects })
    }
  } finally {
    suppressAutosave(false)
  }

  return true
}
