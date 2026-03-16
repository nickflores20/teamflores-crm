import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { LeadsProvider } from './context/LeadsContext.jsx'
import { TasksProvider } from './context/TasksContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { NotificationsProvider } from './context/NotificationsContext.jsx'
import { seedDemoData } from './api/demoSeed.js'
import './index.css'

// Seed realistic demo data into localStorage on first load (USE_MOCK=true only)
seedDemoData()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LeadsProvider>
          <TasksProvider>
            <ToastProvider>
              <NotificationsProvider>
                <App />
              </NotificationsProvider>
            </ToastProvider>
          </TasksProvider>
        </LeadsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
