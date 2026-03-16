import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'

const STATUS_ORDER  = ['New', 'Contacted', 'Qualified', 'Closed', 'Lost']
const STATUS_COLORS = {
  New:       '#94A3B8',
  Contacted: '#3B82F6',
  Qualified: '#C6A76F',
  Closed:    '#22C55E',
  Lost:      '#EF4444',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { status, count, pct } = payload[0].payload
  return (
    <div className="bg-white border border-surface-border rounded-lg px-3 py-2 shadow-card">
      <p className="text-xs text-ink-muted">{status}</p>
      <p className="text-sm font-semibold text-ink">{count} leads</p>
      <p className="text-xs text-ink-secondary">{pct}% of total</p>
    </div>
  )
}

export default function FunnelChart({ leads }) {
  const total = leads.length || 1
  const data = STATUS_ORDER.map(status => ({
    status,
    count: leads.filter(l => l['Status'] === status).length,
    pct: Math.round((leads.filter(l => l['Status'] === status).length / total) * 100),
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
        <XAxis dataKey="status" tick={{ fill: '#718096', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: '#718096', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          <LabelList dataKey="count" position="top" style={{ fill: '#718096', fontSize: 10 }} />
          {data.map(entry => (
            <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
