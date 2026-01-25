import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

import './app/i18n'
import './main.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
