import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const BUCKETS = [
  { key: 'under1',   label: '< 1 hr',   color: '#16A34A', bg: '#DCFCE7' },
  { key: 'one2four', label: '1–4 hrs',  color: '#C6A76F', bg: '#FEF9E7' },
  { key: 'four2day', label: '4–24 hrs', color: '#F97316', bg: '#FFF7ED' },
  { key: 'overDay',  label: '> 24 hrs', color: '#DC2626', bg: '#FEF2F2' },
  { key: 'never',    label: 'Never',    color: '#94A3B8', bg: '#F8FAFC' },
]

function getSpeedBreakdown(leads) {
  const counts = { under1: 0, one2four: 0, four2day: 0, overDay: 0, never: 0 }

  leads.forEach(lead => {
    try {
      const events = JSON.parse(localStorage.getItem(`crm_timeline_${lead.rowNumber}`) || '[]')
      const firstContact = events
        .filter(e => ['email_sent', 'call', 'text_sent'].includes(e.type))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0]

      if (!firstContact) { counts.never++; return }

      const submittedAt = lead['Submitted At'] || lead['Date']
      if (!submittedAt) { counts.never++; return }

      const diffHrs = (new Date(firstContact.timestamp) - new Date(submittedAt)) / 3_600_000
      if (diffHrs < 0)  { counts.never++; return }

      if (diffHrs < 1)  counts.under1++
      else if (diffHrs < 4)  counts.one2four++
      else if (diffHrs < 24) counts.four2day++
      else                   counts.overDay++
    } catch {
      counts.never++
    }
  })

  return BUCKETS.map(b => ({ ...b, count: counts[b.key] }))
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-surface-border rounded-lg px-3 py-2 shadow-card text-xs">
      <p className="font-semibold text-ink">{d.label}</p>
      <p style={{ color: d.color }}>{d.count} lead{d.count !== 1 ? 's' : ''}</p>
    </div>
  )
}

export default function SpeedToLeadChart({ leads }) {
  const data  = useMemo(() => getSpeedBreakdown(leads), [leads])
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(198,167,111,0.08)' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={64}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 justify-center">
        {data.map(d => (
          <div key={d.key} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-ink-secondary">{d.label}</span>
            <span className="text-xs font-semibold text-ink">{d.count}</span>
            {total > 0 && (
              <span className="text-[10px] text-ink-muted">
                ({Math.round(d.count / total * 100)}%)
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
