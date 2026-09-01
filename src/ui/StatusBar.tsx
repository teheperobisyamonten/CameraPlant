import { useEffect } from 'react'
import { useProjectStore } from '../state/projectStore'
import { useScaleStore } from '../state/scaleStore'
import { useViewportStore } from '../state/viewportStore'

const SAVED_MESSAGE_DURATION_MS = 2000

export function StatusBar() {
  const scale = useViewportStore((s) => s.scale)
  const pixelsPerMeter = useScaleStore((s) => s.pixelsPerMeter)
  const saveStatus = useProjectStore((s) => s.saveStatus)
  const setSaveStatus = useProjectStore((s) => s.setSaveStatus)

  useEffect(() => {
    if (saveStatus !== 'saved') return
    const timer = setTimeout(() => setSaveStatus('idle'), SAVED_MESSAGE_DURATION_MS)
    return () => clearTimeout(timer)
  }, [saveStatus, setSaveStatus])

  return (
    <div className="statusbar">
      <span>Zoom {Math.round(scale * 100)}%</span>
      <span>
        {pixelsPerMeter ? `Scale 1m = ${Math.round(pixelsPerMeter)}px` : 'Scale not configured'}
      </span>
      {saveStatus === 'saving' && <span>Saving…</span>}
      {saveStatus === 'saved' && <span>Saved</span>}
      {saveStatus === 'error' && <span className="statusbar__error">Save failed</span>}
    </div>
  )
}
