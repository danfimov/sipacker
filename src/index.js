import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App'
import * as serviceWorker from './serviceWorkerRegistration'

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

serviceWorker.register()
