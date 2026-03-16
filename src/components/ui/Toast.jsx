import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../../context/ToastContext.jsx'

// Left border color + icon per type
const TYPE_STYLES = {
  success: { border: 'border-l-green-500', icon: 'text-green-500', bg: 'bg-green-50' },
  error:   { border: 'border-l-red-500',   icon: 'text-red-500',   bg: 'bg-red-50'   },
  info:    { border: 'border-l-blue-500',  icon: 'text-blue-500',  bg: 'bg-blue-50'  },
}

const ICONS = {
  success: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" />
    </svg>
  ),
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 3500)
    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  const s = TYPE_STYLES[toast.type] || TYPE_STYLES.info

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-center gap-3 min-w-[280px] max-w-sm pr-4 pl-4 py-3 bg-white border border-surface-border border-l-4 ${s.border} rounded-lg shadow-card-md`}
    >
      <span className={s.icon}>{ICONS[toast.type] || ICONS.info}</span>
      <p className="text-sm font-medium text-ink flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-ink-muted hover:text-ink-secondary transition-colors ml-1 flex-shrink-0"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
}
