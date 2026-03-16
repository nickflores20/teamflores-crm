import { useState, useRef, useEffect } from 'react'
import Badge from '../ui/Badge.jsx'

const STATUSES = ['New', 'Contacted', 'Qualified', 'Closed', 'Lost']

export default function StatusSelect({ status, onChange, disabled = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); !disabled && setOpen(v => !v) }}
        disabled={disabled}
        className={`flex items-center gap-1 group ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        <Badge status={status} size="sm" />
        {!disabled && (
          <svg className="w-3 h-3 text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 bg-white border border-surface-border rounded-xl shadow-card-lg overflow-hidden min-w-[148px]">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={(e) => { e.stopPropagation(); onChange(s); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-surface-secondary transition-colors text-left ${s === status ? 'bg-surface-secondary' : ''}`}
            >
              <Badge status={s} size="xs" showDot />
              {s === status && (
                <svg className="w-3.5 h-3.5 text-gold ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
