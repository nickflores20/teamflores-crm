import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'

const STATUSES = ['New', 'Contacted', 'Qualified', 'Closed', 'Lost']
const STATUS_COLORS = {
  New:       '#94A3B8',
  Contacted: '#3B82F6',
  Qualified: '#C6A76F',
  Closed:    '#22C55E',
  Lost:      '#EF4444',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-border rounded-xl px-3 py-2.5 shadow-card">
      <p className="text-xs text-ink-muted mb-1.5">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 text-xs mb-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.fill }} />
          <span className="text-ink-secondary">{p.name}:</span>
          <span className="text-ink font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function MonthlyGroupedBar({ leads }) {
  const months = {}
  for (let i = 11; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const key = d.toISOString().slice(0, 7)
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    months[key] = { label, New: 0, Contacted: 0, Qualified: 0, Closed: 0, Lost: 0 }
  }

  leads.forEach(l => {
    const raw = l['Date'] || l['Submitted At'] || l['Date Submitted']
    if (!raw) return
    const d = new Date(raw)
    if (isNaN(d)) return
    const key = d.toISOString().slice(0, 7)
    if (!months[key]) return
    const status = l['Status'] || 'New'
    if (months[key][status] !== undefined) months[key][status]++
  })

  const data = Object.values(months)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="label" tick={{ fill: '#A0AEC0', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: '#A0AEC0', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
        <Legend
          iconType="circle"
          iconSize={7}
          formatter={(v) => <span style={{ color: '#718096', fontSize: 10 }}>{v}</span>}
        />
        {STATUSES.map(status => (
          <Bar
            key={status}
            dataKey={status}
            stackId="a"
            fill={STATUS_COLORS[status]}
            fillOpacity={0.85}
            radius={status === 'Lost' ? [4, 4, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
