import { useMemo, useEffect, useState } from 'react'

function StatCard({ label, value, color, bg, icon }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (value === 0) { setCount(0); return }
    const steps = 25, step = value / steps
    let cur = 0
    const t = setInterval(() => {
      cur += step
      if (cur >= value) { setCount(value); clearInterval(t) }
      else setCount(Math.floor(cur))
    }, 700 / steps)
    return () => clearInterval(t)
  }, [value])

  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div className={`w-9 h-9 rounded-lg ${bg} ${color} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className={`text-2xl font-bold font-serif ${color} leading-none`}>{count}</p>
        <p className="text-xs text-ink-muted mt-0.5 whitespace-nowrap">{label}</p>
      </div>
    </div>
  )
}

export default function InboxStats({ leads }) {
  const today = new Date().toDateString()
  const month = new Date().getMonth()

  const vals = useMemo(() => ({
    newToday:  leads.filter(l => l['Status'] === 'New' && new Date(l['Date'] || '').toDateString() === today).length,
    contacted: leads.filter(l => l['Status'] === 'Contacted').length,
    qualified: leads.filter(l => l['Status'] === 'Qualified').length,
    closed:    leads.filter(l => l['Status'] === 'Closed' && new Date(l['Date'] || '').getMonth() === month).length,
  }), [leads])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-surface-border border-b border-surface-border bg-white flex-shrink-0">
      <StatCard label="New Today" value={vals.newToday} color="text-blue-600" bg="bg-blue-50"
        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>} />
      <StatCard label="Contacted" value={vals.contacted} color="text-indigo-600" bg="bg-indigo-50"
        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>} />
      <StatCard label="Qualified" value={vals.qualified} color="text-amber-600" bg="bg-amber-50"
        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
      <StatCard label="Closed (Month)" value={vals.closed} color="text-green-600" bg="bg-green-50"
        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>} />
    </div>
  )
}
