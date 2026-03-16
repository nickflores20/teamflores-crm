import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function buildData(leads) {
  const buckets = {}
  leads.forEach(l => {
    const raw = l['Date'] || l['Submitted At'] || l['Date Submitted']
    if (!raw) return
    const d = new Date(raw)
    if (isNaN(d)) return
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d)
    monday.setDate(diff)
    const key = monday.toISOString().slice(0, 10)
    buckets[key] = (buckets[key] || 0) + 1
  })
  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date,
      label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
    }))
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-border rounded-lg px-3 py-2 shadow-card">
      <p className="text-xs text-ink-muted mb-0.5">Week of {label}</p>
      <p className="text-sm font-semibold text-gold">{payload[0].value} lead{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  )
}

export default function LeadsOverTimeChart({ leads }) {
  const data = buildData(leads)

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-48 text-ink-muted text-sm">No data for this period</div>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="goldGradLight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#C6A76F" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#C6A76F" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="label" tick={{ fill: '#A0AEC0', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} tick={{ fill: '#A0AEC0', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="count" stroke="#C6A76F" strokeWidth={2} fill="url(#goldGradLight)" dot={false}
          activeDot={{ r: 4, fill: '#C6A76F', stroke: '#fff', strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
