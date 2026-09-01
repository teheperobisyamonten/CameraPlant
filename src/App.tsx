import { useEffect, useState } from 'react'
import './App.css'
import './ui/panels.css'
import { initAutosave } from './persistence/autosave'
import { loadCustomCameras } from './persistence/customCameraPersistence'
import { loadProject } from './persistence/projectPersistence'
import { TopBar } from './ui/TopBar'
import { LeftSidebar } from './ui/LeftSidebar'
import { PropertiesPanel } from './ui/PropertiesPanel'
import { StatusBar } from './ui/StatusBar'
import { CanvasStage } from './ui/canvas/CanvasStage'
import { ExportPanel } from './ui/ExportPanel'
import { CameraDatabasePanel } from './ui/CameraDatabasePanel'

function App() {
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    initAutosave()
    loadProject().catch((err) => {
      console.error('Failed to load saved project:', err)
      setLoadError('Project could not be loaded.')
    })
    loadCustomCameras().catch((err) => {
      console.error('Failed to load custom cameras:', err)
    })
  }, [])

  return (
    <div className="app-shell">
      <div className="app-shell__topbar">
        <TopBar />
      </div>
      <div className="app-shell__sidebar">
        <LeftSidebar />
      </div>
      <div className="app-shell__canvas">
        <CanvasStage />
        {loadError && <div className="canvas-area__error">{loadError}</div>}
      </div>
      <div className="app-shell__properties">
        <PropertiesPanel />
      </div>
      <div className="app-shell__statusbar">
        <StatusBar />
      </div>
      <ExportPanel />
      <CameraDatabasePanel />
    </div>
  )
}

export default App
