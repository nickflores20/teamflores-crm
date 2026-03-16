import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { useLeadsContext, getFullName } from './LeadsContext.jsx'

const STORAGE_KEY       = 'tf_notif_read_at'
const COMMS_READ_KEY    = 'tf_comms_read_at'

const NotificationsContext = createContext(null)

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Scan every crm_timeline_* key in localStorage and return events matching type filter */
function getAllTimelineEvents(types) {
  const results = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith('crm_timeline_')) continue
      try {
        const events = JSON.parse(localStorage.getItem(key) || '[]')
        results.push(...events.filter((e) => types.includes(e.type)))
      } catch {}
    }
  } catch {}
  return results
}

export function NotificationsProvider({ children }) {
  const { leads } = useLeadsContext()

  const [lastReadAt,      setLastReadAt]      = useState(() => Number(localStorage.getItem(STORAGE_KEY) || 0))
  const [commsLastReadAt, setCommsLastReadAt] = useState(() => Number(localStorage.getItem(COMMS_READ_KEY) || 0))

  // ── Lead notifications (new leads in last 24h) ───────────────────────────
  const notifications = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    return leads
      .filter((l) => {
        const t = new Date(l['Submitted At'] || l['Date'] || 0).getTime()
        return t > cutoff
      })
      .map((l) => ({
        id:       `notif-${l.rowNumber}`,
        leadId:   l.rowNumber,
        leadName: getFullName(l),
        status:   l['Status'],
        time:     l['Submitted At'] || l['Date'],
        isNew:    new Date(l['Submitted At'] || l['Date'] || 0).getTime() > lastReadAt,
      }))
      .sort((a, b) => new Date(b.time) - new Date(a.time))
  }, [leads, lastReadAt])

  // ── Communication notifications (emails + texts received in last 48h) ────
  const commNotifications = useMemo(() => {
    const cutoff = Date.now() - 48 * 60 * 60 * 1000
    return getAllTimelineEvents(['email_received', 'text_received'])
      .filter((e) => new Date(e.timestamp || 0).getTime() > cutoff)
      .map((e) => ({
        id:     e.id,
        type:   e.type,
        leadId: e.leadRowNumber,
        subject: e.subject || '',
        preview: e.preview || String(e.body || '').slice(0, 60),
        time:   e.timestamp,
        isNew:  new Date(e.timestamp || 0).getTime() > commsLastReadAt,
      }))
      .sort((a, b) => new Date(b.time) - new Date(a.time))
  }, [commsLastReadAt])

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.isNew).length + commNotifications.filter((n) => n.isNew).length,
    [notifications, commNotifications]
  )

  const markAllRead = useCallback(() => {
    const now = Date.now()
    setLastReadAt(now)
    setCommsLastReadAt(now)
    localStorage.setItem(STORAGE_KEY,    String(now))
    localStorage.setItem(COMMS_READ_KEY, String(now))
  }, [])

  return (
    <NotificationsContext.Provider
      value={{ notifications, commNotifications, unreadCount, markAllRead, lastReadAt }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
