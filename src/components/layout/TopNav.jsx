import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNotifications } from '../../context/NotificationsContext.jsx'
import Avatar from '../ui/Avatar.jsx'
import Button from '../ui/Button.jsx'
import { formatDistanceToNow } from '../../lib/dateUtils.js'

export default function TopNav({ title, onQuickAdd }) {
  const { logout } = useAuth()
  const { notifications, unreadCount, markAllRead } = useNotifications()
  const navigate = useNavigate()
  const [showNotif, setShowNotif] = useState(false)
  const [showAvatar, setShowAvatar] = useState(false)
  const notifRef = useRef(null)
  const avatarRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setShowAvatar(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-topnav flex items-center justify-between px-4 lg:px-6 border-b border-surface-border bg-white flex-shrink-0 z-30 sticky top-0">
      {/* Title */}
      <h1 className="font-serif text-xl text-navy-800 font-semibold">{title}</h1>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Global search hint */}
        <button
          onClick={() => {
            const e = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })
            document.dispatchEvent(e)
          }}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-secondary border border-surface-border rounded-lg text-sm text-ink-tertiary hover:border-surface-border-strong hover:text-ink-secondary transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <span className="text-ink-muted text-xs">Search</span>
          <kbd className="ml-1 px-1.5 py-0.5 bg-white border border-surface-border rounded text-[10px] text-ink-muted">⌘K</kbd>
        </button>

        {/* Add Lead */}
        <Button
          variant="gold"
          size="sm"
          onClick={onQuickAdd}
          icon={
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          }
          className="hidden sm:inline-flex"
        >
          Add Lead
        </Button>
        <button
          onClick={onQuickAdd}
          className="sm:hidden w-8 h-8 rounded-lg bg-gold text-white flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotif(v => !v); setShowAvatar(false) }}
            className="relative w-9 h-9 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-secondary flex items-center justify-center transition-colors"
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-1.5 w-80 bg-white border border-surface-border rounded-xl shadow-card-lg overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
                <span className="text-sm font-semibold text-ink">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-gold hover:text-gold-dark transition-colors font-medium">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-ink-muted text-sm">No new notifications</div>
                ) : (
                  notifications.map(n => (
                    <button
                      key={n.id}
                      onClick={() => { navigate(`/people/${n.leadId}`); setShowNotif(false) }}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-surface-secondary transition-colors text-left border-b border-surface-border last:border-0"
                    >
                      <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.isNew ? 'bg-gold' : 'bg-surface-tertiary'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${n.isNew ? 'text-ink font-semibold' : 'text-ink-secondary'}`}>{n.leadName}</p>
                        <p className="text-xs text-ink-muted mt-0.5">{n.status} · {formatDistanceToNow(n.time)}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="relative" ref={avatarRef}>
          <button
            onClick={() => { setShowAvatar(v => !v); setShowNotif(false) }}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-surface-secondary transition-colors"
          >
            <Avatar name="Nick Flores" size="sm" />
          </button>
          {showAvatar && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-surface-border rounded-xl shadow-card-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-surface-border">
                <p className="text-sm font-semibold text-ink">Nick Flores</p>
                <p className="text-xs text-ink-muted">Loan Officer</p>
              </div>
              <button
                onClick={() => { navigate('/settings'); setShowAvatar(false) }}
                className="w-full text-left px-4 py-2.5 text-sm text-ink-secondary hover:text-ink hover:bg-surface-secondary transition-colors"
              >
                Settings
              </button>
              <div className="border-t border-surface-border">
                <button
                  onClick={() => { logout(); navigate('/login') }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
