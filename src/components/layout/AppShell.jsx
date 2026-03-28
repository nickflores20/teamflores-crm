import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopNav from './TopNav.jsx'
import MobileTabBar from './MobileTabBar.jsx'
import NMLSFooter from './NMLSFooter.jsx'
import { ToastContainer } from '../ui/Toast.jsx'
import { useLeadsContext } from '../../context/LeadsContext.jsx'
import { useAutoRefresh } from '../../hooks/useAutoRefresh.js'
import GlobalSearch from '../global/GlobalSearch.jsx'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/inbox':    'Inbox',
  '/people':   'People',
  '/deals':    'Pipeline',
  '/tasks':    'Tasks',
  '/reports':  'Reports',
  '/settings': 'Settings',
}

export default function AppShell({ children, onQuickAdd }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()
  const { fetchLeads } = useLeadsContext()

  useEffect(() => { fetchLeads() }, [fetchLeads])
  useAutoRefresh(fetchLeads)

  const title = PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/people/') ? 'Lead Detail' : 'CRM')

  return (
    <div className="flex h-screen overflow-hidden bg-surface-secondary">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav title={title} onQuickAdd={onQuickAdd} />

        <main className="flex-1 overflow-y-auto pb-tabbar lg:pb-0 bg-surface-secondary">
          {children}
          <NMLSFooter />
        </main>
      </div>

      <MobileTabBar />
      <ToastContainer />
      <GlobalSearch />
    </div>
  )
}
