import { Profiler, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const renderMetric = { current: null }

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Profiler id="dashboard" onRender={(id, phase, actualDuration) => {
      renderMetric.current = { id, phase, actualDuration }
    }}>
      <App onRenderMetric={renderMetric} />
    </Profiler>
  </StrictMode>,
)
