import { db } from './db'
import { useCustomLensStore } from '../state/customLensStore'
import type { LensDefinition } from '../types/lensDefinition'

export async function loadCustomLenses(): Promise<void> {
  const all = await db.customLenses.toArray()
  useCustomLensStore.getState().setCustomLenses(all)
}

export async function saveCustomLens(lens: LensDefinition): Promise<void> {
  await db.customLenses.put(lens)
}

export async function deleteCustomLens(id: string): Promise<void> {
  await db.customLenses.delete(id)
}
