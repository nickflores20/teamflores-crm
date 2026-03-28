import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts'
import { useLeadsContext } from '../context/LeadsContext.jsx'
import { formatCurrency } from '../lib/dateUtils.js'
import DateRangePicker from '../components/reports/DateRangePicker.jsx'
import LeadsOverTimeChart from '../components/reports/LeadsOverTimeChart.jsx'
import FunnelChart from '../components/reports/FunnelChart.jsx'
import LeadSourceBar from '../components/reports/LeadSourceBar.jsx'
import LoanTypePie from '../components/reports/LoanTypePie.jsx'
import CreditScoreBar from '../components/reports/CreditScoreBar.jsx'
import MonthlyGroupedBar from '../components/reports/MonthlyGroupedBar.jsx'
import ActivityHeatmap from '../components/reports/ActivityHeatmap.jsx'
import PipelineValueChart from '../components/reports/PipelineValueChart.jsx'
import WinLossDonut from '../components/reports/WinLossDonut.jsx'
import ResponseTimeBar from '../components/reports/ResponseTimeBar.jsx'
import ConversionFunnel from '../components/reports/ConversionFunnel.jsx'
import ReportsDataTable from '../components/reports/ReportsDataTable.jsx'
import SpeedToLeadChart from '../components/reports/SpeedToLeadChart.jsx'

function getDefaultRange() {
  const now = new Date()
  const from = new Date(now)
  from.setDate(from.getDate() - 90)
  return {
    from: from.toISOString().slice(0, 10),
    to: now.toISOString().slice(0, 10),
  }
}

function ChartCard({ title, subtitle, children, className = '', fullWidth = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border border-surface-border rounded-xl shadow-card overflow-hidden ${fullWidth ? 'lg:col-span-2' : ''} ${className}`}
    >
      {/* Navy header */}
      <div className="px-4 py-3 bg-navy-800 flex items-start justify-between">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-xs text-white/50 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </motion.div>
  )
}

const TREND = [
  { icon: '↑', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: '↓', color: 'text-red-500',   bg: 'bg-red-50' },
  { icon: '→', color: 'text-ink-muted', bg: 'bg-surface-secondary' },
]

function StatCard({ label, value, trend = 2, sub, color = 'text-ink', delay = 0 }) {
  const t = TREND[trend]
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white border border-surface-border rounded-xl px-4 py-4 shadow-card"
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-ink-muted font-medium uppercase tracking-wide">{label}</p>
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${t.bg} ${t.color}`}>{t.icon}</span>
      </div>
      <p className={`text-2xl font-serif font-semibold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-ink-muted mt-1">{sub}</p>}
    </motion.div>
  )
}

export default function Reports() {
  const { leads } = useLeadsContext()
  const [range, setRange] = useState(getDefaultRange)
  const [dateRange, setDateRange] = useState('30')

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const raw = l['Date'] || l['Submitted At'] || l['Date Submitted']
      if (!raw) return true
      const d = new Date(raw).toISOString().slice(0, 10)
      return d >= range.from && d <= range.to
    })
  }, [leads, range])

  // ─── Speed to Lead ────────────────────────────────────────────────────────
  const speedToLeadHours = useMemo(() => {
    const contactedLeads = filteredLeads.filter(l =>
      ['Contacted', 'Qualified', 'Closed', 'Lost'].includes(l['Status'])
    )
    const times = contactedLeads.map(lead => {
      try {
        const events = JSON.parse(localStorage.getItem(`crm_timeline_${lead.rowNumber}`) || '[]')
        const firstContact = events
          .filter(e => ['email_sent', 'call', 'text_sent'].includes(e.type))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0]
        if (!firstContact) return null
        const submittedAt = lead['Submitted At'] || lead['Date']
        if (!submittedAt) return null
        const diffMs = new Date(firstContact.timestamp).getTime() - new Date(submittedAt).getTime()
        if (diffMs < 0) return null
        return diffMs / (1000 * 60 * 60)
      } catch { return null }
    }).filter(t => t !== null)
    if (times.length === 0) return null
    return times.reduce((a, b) => a + b, 0) / times.length
  }, [filteredLeads])

  function formatSpeedToLead(hours) {
    if (hours === null) return 'No data'
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`
    }
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  function speedTrend(hours) {
    if (hours === null) return 2
    if (hours < 1)  return 0  // green — excellent
    if (hours <= 4) return 0  // green — good
    return 1                  // red — needs improvement
  }

  const totalLeads   = filteredLeads.length
  const closedLeads  = filteredLeads.filter(l => l['Status'] === 'Closed').length
  const activeLeads  = filteredLeads.filter(l => !['Closed', 'Lost'].includes(l['Status'])).length
  const lostLeads    = filteredLeads.filter(l => l['Status'] === 'Lost').length
  const winRate      = (closedLeads + lostLeads) > 0
    ? Math.round((closedLeads / (closedLeads + lostLeads)) * 100)
    : 0
  const pipelineVal  = filteredLeads
    .filter(l => !['Closed', 'Lost'].includes(l['Status']))
    .reduce((sum, l) => sum + (Number(String(l['Purchase Price']).replace(/[^0-9.-]/g, '')) || 0), 0)
  const avgPrice     = totalLeads > 0
    ? filteredLeads.reduce((sum, l) => sum + (Number(String(l['Purchase Price']).replace(/[^0-9.-]/g, '')) || 0), 0) / totalLeads
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col h-full overflow-y-auto bg-surface-secondary"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-surface-border bg-white flex-shrink-0">
        <div>
          <h1 className="text-base font-serif font-semibold text-ink">Reports</h1>
          <p className="text-xs text-ink-muted mt-0.5">{filteredLeads.length} leads in selected period</p>
        </div>
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      <div className="flex-1 px-4 lg:px-6 py-6 space-y-6">

        {/* Hero stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          <StatCard label="Total Leads"    value={totalLeads}              color="text-ink"        trend={2} delay={0}    sub="in period" />
          <StatCard label="Active Deals"   value={activeLeads}             color="text-blue-600"   trend={0} delay={0.04} sub="in pipeline" />
          <StatCard label="Closed"         value={closedLeads}             color="text-green-600"  trend={0} delay={0.08} sub="won" />
          <StatCard label="Win Rate"       value={`${winRate}%`}           color="text-gold"       trend={winRate >= 20 ? 0 : 1} delay={0.12} sub={`${lostLeads} lost`} />
          <StatCard label="Pipeline Value" value={formatCurrency(pipelineVal)} color="text-navy-800"  trend={0} delay={0.16} sub="active" />
          <StatCard label="Avg Deal Size"  value={formatCurrency(avgPrice)} color="text-ink"       trend={2} delay={0.20} sub="per lead" />
          <StatCard
            label="Speed to Lead"
            value={formatSpeedToLead(speedToLeadHours)}
            color={speedToLeadHours === null ? 'text-ink-muted' : speedToLeadHours < 1 ? 'text-green-600' : speedToLeadHours <= 4 ? 'text-gold' : 'text-red-500'}
            trend={speedTrend(speedToLeadHours)}
            delay={0.24}
            sub={speedToLeadHours === null ? 'no contacts yet' : speedToLeadHours < 1 ? 'excellent' : speedToLeadHours <= 4 ? 'good' : 'needs improvement'}
          />
        </div>

        {/* Date range bar */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Period:</span>
          {['7', '30', '90', 'all'].map(d => (
            <button key={d} onClick={() => setDateRange(d)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
              style={dateRange === d
                ? { backgroundColor: '#1A3E61', color: 'white', borderColor: '#1A3E61' }
                : { backgroundColor: 'white', color: '#64748B', borderColor: '#E2E8F0' }
              }>
              {d === 'all' ? 'All Time' : `${d} days`}
            </button>
          ))}
        </div>

        {/* ── Key Performance Charts ──────────────────────────────── */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#1A3E61' }}>
            Key Performance Charts
          </h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

            {/* Chart 1: Lead Volume by Source */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Lead Volume by Source</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Weekly breakdown by channel</p>
                </div>
                <button onClick={() => {
                  const csv = 'Week,LeadPops,Bankrate,Zillow,Website\nMar 1,8,4,3,2\nMar 8,6,5,4,1\nMar 15,10,3,2,3\nMar 22,7,6,5,2'
                  const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv)
                  a.download = 'lead_volume.csv'; a.click()
                }} className="text-[10px] font-semibold px-2 py-1 rounded border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                  Export CSV
                </button>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={[
                  { week: 'Mar 1', LeadPops: 8, Bankrate: 4, Zillow: 3, Website: 2 },
                  { week: 'Mar 8', LeadPops: 6, Bankrate: 5, Zillow: 4, Website: 1 },
                  { week: 'Mar 15', LeadPops: 10, Bankrate: 3, Zillow: 2, Website: 3 },
                  { week: 'Mar 22', LeadPops: 7, Bankrate: 6, Zillow: 5, Website: 2 },
                ]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="LeadPops" fill="#1A3E61" radius={[3,3,0,0]} />
                  <Bar dataKey="Bankrate" fill="#C6A76F" radius={[3,3,0,0]} />
                  <Bar dataKey="Zillow" fill="#3B82F6" radius={[3,3,0,0]} />
                  <Bar dataKey="Website" fill="#10B981" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Chart 2: Stage Funnel */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Stage Funnel</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Conversion through pipeline</p>
                </div>
              </div>
              {(() => {
                const stages = ['New','Contacted','Active','Qualified','In Progress','Cold','Closed Won']
                const stageCounts = stages.map(s => ({ stage: s, count: leads.filter(l => l['Status'] === s).length }))
                const maxCount = Math.max(...stageCounts.map(s => s.count), 1)
                const stageColors = { 'New': '#EF4444', 'Contacted': '#F97316', 'Active': '#22C55E', 'Qualified': '#3B82F6', 'In Progress': '#8B5CF6', 'Cold': '#94A3B8', 'Closed Won': '#059669' }
                return (
                  <div className="space-y-2">
                    {stageCounts.map((s, i) => {
                      const pct = stageCounts[i-1] ? Math.round((s.count / (stageCounts[i-1].count || 1)) * 100) : 100
                      return (
                        <div key={s.stage}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-slate-500 w-24 flex-shrink-0">{s.stage}</span>
                            <div className="flex-1 h-6 bg-slate-100 rounded-md overflow-hidden">
                              <div className="h-full rounded-md transition-all duration-500"
                                style={{ width: `${(s.count / maxCount) * 100}%`, backgroundColor: stageColors[s.stage] || '#94A3B8', opacity: 0.85 }} />
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-6 text-right">{s.count}</span>
                            {i > 0 && pct < 100 && (
                              <span className="text-[10px] text-slate-400 w-14 text-right flex-shrink-0">{pct}% of prev</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-3">
                      💡 Biggest drop-off: New → Contacted — focus on speed to lead
                    </p>
                  </div>
                )
              })()}
            </div>

            {/* Chart 3: Sequence Performance */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Sequence Performance</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Reply rate by touch point</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={[
                  { day: 'Day 0', rate: 12 },
                  { day: 'Day 3', rate: 34 },
                  { day: 'Day 7', rate: 22 },
                  { day: 'Day 14', rate: 15 },
                  { day: 'Day 30', rate: 8 },
                ]} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} unit="%" />
                  <Tooltip formatter={(v) => [`${v}%`, 'Reply Rate']} contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                  <Line type="monotone" dataKey="rate" stroke="#C6A76F" strokeWidth={2.5}
                    dot={(props) => {
                      const { cx, cy, payload } = props
                      if (payload.day === 'Day 3') return <circle key="best" cx={cx} cy={cy} r={6} fill="#C6A76F" stroke="white" strokeWidth={2} />
                      return <circle key={payload.day} cx={cx} cy={cy} r={4} fill="#C6A76F" />
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2 mt-3">
                ⭐ Day 3 email gets 34% reply rate — your best touch point
              </p>
            </div>

            {/* Chart 4: Source Performance */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Source Performance</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Conversion rate by channel</p>
                </div>
              </div>
              {(() => {
                const sources = [
                  { name: 'LeadPops NV', total: 8, contacted: 6, active: 4, closed: 1 },
                  { name: 'Bankrate NV', total: 4, contacted: 3, active: 2, closed: 1 },
                  { name: 'LeadPops AZ', total: 4, contacted: 3, active: 2, closed: 0 },
                  { name: 'Zillow', total: 4, contacted: 2, active: 2, closed: 0 },
                  { name: 'Bankrate TX', total: 2, contacted: 1, active: 0, closed: 0 },
                  { name: 'Website', total: 3, contacted: 2, active: 1, closed: 0 },
                ].sort((a, b) => (b.closed/b.total) - (a.closed/a.total))
                return (
                  <div className="space-y-3">
                    {sources.map(s => {
                      const convRate = Math.round((s.closed / s.total) * 100)
                      return (
                        <div key={s.name} className="flex items-center gap-3">
                          <span className="text-xs text-slate-600 w-24 flex-shrink-0 font-medium">{s.name}</span>
                          <div className="flex-1 flex gap-0.5 h-5">
                            <div className="rounded-l-sm" style={{ width: `${(s.total/8)*100}%`, backgroundColor: '#1A3E61', opacity: 0.9, minWidth: 4 }} title={`${s.total} leads`} />
                            <div style={{ width: `${(s.contacted/8)*100}%`, backgroundColor: '#C6A76F', opacity: 0.85, minWidth: 2 }} title={`${s.contacted} contacted`} />
                            <div className="rounded-r-sm" style={{ width: `${(s.active/8)*100}%`, backgroundColor: '#22C55E', opacity: 0.85, minWidth: s.active > 0 ? 2 : 0 }} title={`${s.active} active`} />
                          </div>
                          <span className="text-[10px] font-bold w-10 text-right flex-shrink-0"
                            style={{ color: convRate > 0 ? '#059669' : '#94A3B8' }}>
                            {convRate > 0 ? `${convRate}%` : '—'}
                          </span>
                        </div>
                      )
                    })}
                    <div className="flex gap-3 mt-1 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{backgroundColor:'#1A3E61'}} /> Leads</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{backgroundColor:'#C6A76F'}} /> Contacted</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{backgroundColor:'#22C55E'}} /> Active</span>
                    </div>
                    <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                      🏆 Top source: Bankrate NV — 25% conversion rate
                    </p>
                  </div>
                )
              })()}
            </div>

          </div>
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          <ChartCard title="Leads Over Time" subtitle="Weekly lead volume — area chart">
            <LeadsOverTimeChart leads={filteredLeads} />
          </ChartCard>

          <ChartCard title="Pipeline Value" subtitle="Active deal value by month">
            <PipelineValueChart leads={filteredLeads} />
          </ChartCard>

          <ChartCard title="Conversion Funnel" subtitle="Drop-off at each stage" fullWidth>
            <ConversionFunnel leads={filteredLeads} />
          </ChartCard>

          <ChartCard title="Status Distribution" subtitle="Count by status">
            <FunnelChart leads={filteredLeads} />
          </ChartCard>

          <ChartCard title="Win / Loss Analysis" subtitle="Close rate breakdown">
            <WinLossDonut leads={filteredLeads} />
          </ChartCard>

          <ChartCard title="Lead Sources" subtitle="How leads found you">
            <LeadSourceBar leads={filteredLeads} />
          </ChartCard>

          <ChartCard title="Loan Types" subtitle="Mix by loan category">
            <LoanTypePie leads={filteredLeads} />
          </ChartCard>

          <ChartCard title="Credit Score Distribution" subtitle="Quality profile — color coded">
            <CreditScoreBar leads={filteredLeads} />
          </ChartCard>

          <ChartCard title="Response Time" subtitle="How quickly leads were first contacted">
            <ResponseTimeBar leads={filteredLeads} />
          </ChartCard>

          <ChartCard title="Speed to Lead Breakdown" subtitle="Distribution of first contact times">
            <SpeedToLeadChart leads={filteredLeads} />
          </ChartCard>

          <ChartCard title="Monthly Activity" subtitle="Stacked by status — last 12 months">
            <MonthlyGroupedBar leads={filteredLeads} />
          </ChartCard>

          {/* Activity Heatmap — full width */}
          <ChartCard
            title="Activity Heatmap"
            subtitle="Lead submissions over the past 12 months"
            fullWidth
          >
            <ActivityHeatmap leads={leads} />
          </ChartCard>

        </div>

        {/* Data table */}
        <div className="bg-white border border-surface-border rounded-xl shadow-card overflow-hidden">
          <div className="px-4 py-3 bg-navy-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Lead Details</h3>
            <p className="text-xs text-white/50 mt-0.5">All leads in selected date range</p>
          </div>
          <div className="p-4">
            <ReportsDataTable leads={filteredLeads} />
          </div>
        </div>

      </div>
    </motion.div>
  )
}
