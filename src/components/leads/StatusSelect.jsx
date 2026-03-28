import { useState, useRef, useEffect } from 'react'
import Badge from '../ui/Badge.jsx'

// All 8 stages. Manual-only stages are marked — they cannot be auto-assigned.
export const ALL_STAGES = [
  'New',
  'Contacted',
  'Active',
  'Qualified',
  'In Progress',
  'Closed Won',
  'Cold',
  'Dead',
]

// Stages Nick Sr. can manually set
const MANUAL_STAGES = ALL_STAGES

// Auto-assigned stages (shown grayed out in dropdown with note)
const AUTO_STAGES = new Set(['New', 'Contacted', 'Active', 'Cold', 'Dead'])

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
          <svg className="w-3 h-3 text-[#888] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 bg-white border border-[#E2E8F0] rounded-xl shadow-lg overflow-hidden min-w-[160px]">
          <div className="px-3 py-1.5 border-b border-[#F1F5F9]">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Set Stage</p>
          </div>
          {MANUAL_STAGES.map(s => (
            <button
              key={s}
              onClick={(e) => { e.stopPropagation(); onChange(s); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#F8FAFC] transition-colors text-left ${s === status ? 'bg-[#F8FAFC]' : ''}`}
            >
              <Badge status={s} size="xs" showDot />
              {AUTO_STAGES.has(s) && s !== status && (
                <span className="ml-auto text-[9px] text-[#94A3B8] font-medium">auto</span>
              )}
              {s === status && (
                <svg className="w-3.5 h-3.5 text-[#C6A76F] ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
