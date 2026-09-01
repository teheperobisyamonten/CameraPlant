import './App.css'
import './ui/panels.css'
import { TopBar } from './ui/TopBar'
import { LeftSidebar } from './ui/LeftSidebar'
import { PropertiesPanel } from './ui/PropertiesPanel'
import { StatusBar } from './ui/StatusBar'
import { CanvasStage } from './ui/canvas/CanvasStage'

function App() {
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
      </div>
      <div className="app-shell__properties">
        <PropertiesPanel />
      </div>
      <div className="app-shell__statusbar">
        <StatusBar />
      </div>
    </div>
  )
}

export default App
