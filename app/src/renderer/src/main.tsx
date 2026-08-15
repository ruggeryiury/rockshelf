import { createRoot } from 'react-dom/client'
import { App } from './App'

import './app/i18n'
import './app/styles/main.css'

createRoot(document.getElementById('root')!).render(<App />)
