import { useMemo } from 'react'
import LENSES from './lenses.json'
import { useCustomLensStore } from '../state/customLensStore'
import type { LensDefinition } from '../types/lensDefinition'

export const BUILTIN_LENS_DEFINITIONS = LENSES as LensDefinition[]

/** Reactive built-in + user-added lens list, for components that render a selection list. */
export function useLensDefinitions(): LensDefinition[] {
  const custom = useCustomLensStore((s) => s.customLenses)
  return useMemo(() => [...BUILTIN_LENS_DEFINITIONS, ...custom], [custom])
}

/** Non-reactive snapshot, for plain functions (not components) that just need a one-off lookup. */
export function getLensDefinitionsSnapshot(): LensDefinition[] {
  return [...BUILTIN_LENS_DEFINITIONS, ...useCustomLensStore.getState().customLenses]
}
