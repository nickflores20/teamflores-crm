import { useState, useRef, useEffect } from 'react'
import { exportLeadsToCSV } from '../../lib/csvExport.js'
import { todayISO } from '../../lib/dateUtils.js'

export default function ExportButton({ leads, filteredLeads }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const thisMonth = todayISO().slice(0, 7)

  const exportOptions = [
    {
      label: 'All Leads',
      sublabel: `${leads.length} leads`,
      action: () => exportLeadsToCSV(leads, `leads_all_${todayISO()}.csv`),
    },
    {
      label: 'Filtered Leads',
      sublabel: `${filteredLeads.length} leads`,
      action: () => exportLeadsToCSV(filteredLeads, `leads_filtered_${todayISO()}.csv`),
    },
    {
      label: 'This Month',
      sublabel: thisMonth,
      action: () => {
        const monthly = leads.filter(l => {
          const d = (l['Submitted At'] || l['Date'] || '').slice(0, 7)
          return d === thisMonth
        })
        exportLeadsToCSV(monthly, `leads_${thisMonth}.csv`)
      },
    },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 hover:border-gold/30 text-sand/60 hover:text-sand transition-all text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Export
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-navy-800 border border-gold/20 rounded-xl shadow-floating overflow-hidden z-50">
          {exportOptions.map(opt => (
            <button
              key={opt.label}
              onClick={() => { opt.action(); setOpen(false) }}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
            >
              <span className="text-sm text-sand font-medium">{opt.label}</span>
              <span className="text-xs text-sand/40">{opt.sublabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
