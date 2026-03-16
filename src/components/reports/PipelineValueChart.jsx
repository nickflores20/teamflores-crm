import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function formatM(val) {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`
  return `$${val}`
}

function buildData(leads) {
  const buckets = {}
  leads.forEach(l => {
    if (['Closed', 'Lost'].includes(l['Status'])) return
    const raw = l['Date'] || l['Submitted At'] || l['Date Submitted']
    if (!raw) return
    const d = new Date(raw)
    if (isNaN(d)) return
    const key = d.toISOString().slice(0, 7)
    const price = Number(String(l['Purchase Price']).replace(/[^0-9.-]/g, '')) || 0
    buckets[key] = (buckets[key] || 0) + price
  })
  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({
      month,
      label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      value,
    }))
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-border rounded-lg px-3 py-2 shadow-card">
      <p className="text-xs text-ink-muted mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-navy-800">{formatM(payload[0].value)}</p>
      <p className="text-xs text-ink-muted">active pipeline</p>
    </div>
  )
}

export default function PipelineValueChart({ leads }) {
  const data = buildData(leads)

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-ink-muted text-sm">No data for this period</div>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 10 }}>
        <defs>
          <linearGradient id="navyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#1A3E61" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#1A3E61" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="label" tick={{ fill: '#A0AEC0', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tickFormatter={formatM} tick={{ fill: '#A0AEC0', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="value" stroke="#1A3E61" strokeWidth={2} fill="url(#navyGrad)" dot={false}
          activeDot={{ r: 4, fill: '#1A3E61', stroke: '#fff', strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
