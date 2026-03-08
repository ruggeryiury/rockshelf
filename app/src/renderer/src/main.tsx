import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'

import './app/i18n'
import './app/main.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
