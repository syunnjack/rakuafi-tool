import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import LandingDemo from './LandingDemo.jsx'

createRoot(document.getElementById('demo-root')).render(
  <StrictMode>
    <LandingDemo />
  </StrictMode>,
)
