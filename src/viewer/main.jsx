import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Viewer from './Viewer'
import '../index.css'

let initial = null
try {
  initial = JSON.parse(document.getElementById('character-data').textContent)
} catch {
  // opened the raw template: no character embedded
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {initial ? <Viewer initial={initial} /> : <p>No character data in this file.</p>}
  </StrictMode>
)
