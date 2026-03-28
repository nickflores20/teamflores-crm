import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useLeadsContext } from '../context/LeadsContext.jsx'
import { useTasksContext } from '../context/TasksContext.jsx'
import { formatCurrency } from '../lib/dateUtils.js'

// ─── Constants ───────────────────────────────────────────────────────────────
const NAVY = '#1A3E61'
const GOLD = '#C6A76F'

const STAGE_COLORS = {
  New: '#EF4444',
  Contacted: '#F97316',
  Qualified: '#22C55E',
  Active: '#3B82F6',
  'In Progress': '#8B5CF6',
  Cold: '#6B7280',
  'Closed Won': '#10B981',
}

const ACTIVITY_FEED = [
  { time: '9:42 AM', icon: 'new', text: 'Robert Martinez submitted a new inquiry', sub: 'Bankrate TX — Purchase', lead: 5 },
  { time: '9:15 AM', icon: 'cold', text: 'James Wilson auto-moved to Cold — 7 days no contact', sub: 'LeadPops AZ — VA Loan', lead: 3 },
  { time: '8:55 AM', icon: 'text', text: 'Auto-sequence Day 3 text sent to Carlos Martinez', sub: 'LeadPops NV — Purchase', lead: 8 },
  { time: '8:30 AM', icon: 'reply', text: 'Sarah Johnson replied — sequence paused, stage → Active', sub: 'Bankrate NV — Refi', lead: 4, highlight: true },
  { time: '8:01 AM', icon: 'new', text: 'Emily Chen submitted a new inquiry', sub: 'Zillow — Purchase', lead: 12 },
  { time: '7:45 AM', icon: 'text', text: 'Auto-sequence Day 7 text sent to David Kim', sub: 'Website — Purchase', lead: 15 },
  { time: 'Yesterday 5:30 PM', icon: 'call', text: 'Call logged — Michael Torres — 8 min, Answered', sub: 'LeadPops NV — Purchase', lead: 7 },
]

const ICON_META = {
  new:   { bg: '#DCFCE7', color: '#16A34A', label: '✦' },
  cold:  { bg: '#FEE2E2', color: '#DC2626', label: '❄' },
  text:  { bg: '#DBEAFE', color: '#2563EB', label: '✉' },
  reply: { bg: '#FEF9C3', color: '#A16207', label: '↩' },
  call:  { bg: '#EDE9FE', color: '#7C3AED', label: '✆' },
}

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function isOverdue(dueDate) {
  if (!dueDate) return false
  return dueDate < todayStr()
}

function isToday(dueDate) {
  if (!dueDate) return false
  return dueDate === todayStr()
}

function formatDue(dueDate) {
  if (!dueDate) return ''
  try {
    return new Date(dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch { return dueDate }
}

function todayLong() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function getSourceLabel(howFound) {
  const s = (howFound || '').toLowerCase()
  if (s.includes('leadpops') && s.includes('nv')) return 'LeadPops NV'
  if (s.includes('leadpops') && s.includes('az')) return 'LeadPops AZ'
  if (s.includes('bankrate') && s.includes('nv')) return 'Bankrate NV'
  if (s.includes('bankrate') && s.includes('tx')) return 'Bankrate TX'
  if (s.includes('zillow')) return 'Zillow'
  return 'Website'
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, accent, tag, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: '22px 24px',
        flex: 1,
        minWidth: 0,
        boxShadow: '0 2px 8px rgba(26,62,97,0.07), 0 1px 2px rgba(26,62,97,0.04)',
        borderTop: `3px solid ${accent}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#64748B',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
        }}>
          {label}
        </span>
        <span style={{
          background: accent + '18',
          color: accent,
          borderRadius: 20,
          padding: '2px 9px',
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.06em',
        }}>
          {tag}
        </span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: NAVY, lineHeight: 1.1, marginTop: 4 }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{subtitle}</div>
      )}
    </motion.div>
  )
}

function ActivityIcon({ type }) {
  const meta = ICON_META[type] || ICON_META.new
  return (
    <div style={{
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: meta.bg,
      color: meta.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 13,
      flexShrink: 0,
      fontWeight: 700,
    }}>
      {meta.label}
    </div>
  )
}

function ActivityItem({ item, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        padding: '11px 14px',
        borderRadius: 10,
        cursor: 'pointer',
        borderLeft: item.highlight ? `3px solid ${GOLD}` : '3px solid transparent',
        background: item.highlight ? '#FFFDF5' : hovered ? '#F8FAFC' : 'transparent',
        transition: 'background 0.15s',
        marginBottom: 2,
      }}
    >
      <ActivityIcon type={item.icon} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: NAVY, lineHeight: 1.4 }}>{item.text}</span>
          <span style={{ fontSize: 11, color: '#94A3B8', flexShrink: 0, whiteSpace: 'nowrap' }}>{item.time}</span>
        </div>
        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{item.sub}</div>
      </div>
    </div>
  )
}

function PriorityBadge({ priority }) {
  const styles = {
    High:   { bg: '#FEE2E2', color: '#DC2626' },
    Medium: { bg: '#FEF9C3', color: '#A16207' },
    Low:    { bg: '#F0FDF4', color: '#15803D' },
  }
  const s = styles[priority] || styles.Medium
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      background: s.bg,
      color: s.color,
      borderRadius: 4,
      padding: '2px 7px',
    }}>
      {priority}
    </span>
  )
}

function TaskItem({ task, onToggle }) {
  const overdue = isOverdue(task.dueDate)
  const today = isToday(task.dueDate)
  const borderColor = overdue ? '#EF4444' : today ? '#F97316' : 'transparent'

  return (
    <div style={{
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      padding: '10px 12px',
      borderRadius: 10,
      borderLeft: `3px solid ${borderColor}`,
      background: overdue ? '#FFF5F5' : today ? '#FFFBF5' : '#F8FAFC',
      boxShadow: '0 1px 3px rgba(26,62,97,0.05)',
      marginBottom: 6,
      opacity: task.completed ? 0.55 : 1,
    }}>
      <div
        onClick={onToggle}
        style={{
          width: 18,
          height: 18,
          borderRadius: 5,
          border: `2px solid ${task.completed ? GOLD : '#CBD5E1'}`,
          background: task.completed ? GOLD : '#fff',
          flexShrink: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 1,
          transition: 'background 0.15s, border-color 0.15s',
        }}
      >
        {task.completed && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L4 7L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13,
          fontWeight: 700,
          color: NAVY,
          textDecoration: task.completed ? 'line-through' : 'none',
          lineHeight: 1.4,
        }}>
          {task.title}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
          {task.dueDate && (
            <span style={{ fontSize: 11, color: overdue ? '#EF4444' : '#94A3B8', fontWeight: overdue ? 700 : 400 }}>
              {overdue ? '⚠ ' : ''}{formatDue(task.dueDate)}
            </span>
          )}
          <PriorityBadge priority={task.priority} />
        </div>
      </div>
    </div>
  )
}

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: NAVY,
      color: '#fff',
      borderRadius: 8,
      padding: '8px 14px',
      fontSize: 13,
      fontWeight: 600,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }}>
      <div style={{ color: GOLD, marginBottom: 2 }}>{label}</div>
      <div>{payload[0].value} leads</div>
    </div>
  )
}

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: NAVY,
      color: '#fff',
      borderRadius: 8,
      padding: '8px 14px',
      fontSize: 13,
      fontWeight: 600,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    }}>
      <div style={{ color: GOLD, marginBottom: 2 }}>{payload[0].name}</div>
      <div>{payload[0].value} leads</div>
    </div>
  )
}

function CreateTaskForm({ onAdd, onCancel }) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(todayStr())
  const [priority, setPriority] = useState('Medium')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), dueDate, priority })
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: '#F8FAFC',
      borderRadius: 10,
      padding: '14px',
      border: '1px solid #E2E8F0',
      marginTop: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Task title…"
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: NAVY,
          border: '1px solid #CBD5E1',
          borderRadius: 7,
          padding: '8px 11px',
          outline: 'none',
          background: '#fff',
        }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          style={{
            flex: 1,
            fontSize: 12,
            border: '1px solid #CBD5E1',
            borderRadius: 7,
            padding: '7px 10px',
            color: '#475569',
            background: '#fff',
            outline: 'none',
          }}
        />
        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          style={{
            flex: 1,
            fontSize: 12,
            border: '1px solid #CBD5E1',
            borderRadius: 7,
            padding: '7px 10px',
            color: '#475569',
            background: '#fff',
            outline: 'none',
          }}
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#64748B',
            background: 'transparent',
            border: '1px solid #CBD5E1',
            borderRadius: 7,
            padding: '6px 14px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#fff',
            background: GOLD,
            border: 'none',
            borderRadius: 7,
            padding: '6px 16px',
            cursor: 'pointer',
          }}
        >
          Add Task
        </button>
      </div>
    </form>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const { leads } = useLeadsContext()
  const { tasks, toggleTask, addTask } = useTasksContext()
  const [showCreateTask, setShowCreateTask] = useState(false)

  // ── Stat computations ─────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const now = Date.now()
    const ms24 = 24 * 60 * 60 * 1000

    const newToday = leads.filter(l => {
      if (l['Status'] !== 'New') return false
      const sub = l['Submitted At'] || l['Date Submitted']
      if (!sub) return false
      return now - new Date(sub).getTime() < ms24
    }).length

    const needContact = leads.filter(l => {
      if (l['Status'] !== 'New') return false
      const sub = l['Submitted At'] || l['Date Submitted']
      if (!sub) return false
      const age = now - new Date(sub).getTime()
      if (age < ms24) return false
      try {
        const events = JSON.parse(localStorage.getItem(`crm_timeline_${l.rowNumber}`) || '[]')
        const hasOutbound = events.some(e =>
          ['text_sent', 'email_sent', 'call'].includes(e.type)
        )
        return !hasOutbound
      } catch {
        return true
      }
    }).length

    const coldLeads = leads.filter(l => l['Status'] === 'Cold').length

    const pipelineValue = leads
      .filter(l => ['Qualified', 'In Progress', 'Active'].includes(l['Status']))
      .reduce((sum, l) => {
        const v = Number(String(l['Purchase Price'] || '0').replace(/[^0-9.-]/g, ''))
        return sum + (isNaN(v) ? 0 : v)
      }, 0)

    return { newToday, needContact, coldLeads, pipelineValue }
  }, [leads])

  // ── Chart data ────────────────────────────────────────────────────────────
  const sourceChartData = useMemo(() => {
    const SOURCES = ['LeadPops NV', 'LeadPops AZ', 'Bankrate NV', 'Bankrate TX', 'Zillow', 'Website']
    const counts = {}
    SOURCES.forEach(s => { counts[s] = 0 })
    leads.forEach(l => {
      const src = getSourceLabel(l['How Found'])
      if (counts[src] !== undefined) counts[src]++
    })
    return SOURCES.map(name => ({ name, count: counts[name] || 0 }))
  }, [leads])

  const stageChartData = useMemo(() => {
    const STAGES = ['New', 'Contacted', 'Qualified', 'Active', 'In Progress', 'Cold', 'Closed Won']
    const counts = {}
    STAGES.forEach(s => { counts[s] = 0 })
    leads.forEach(l => {
      const st = l['Status']
      if (counts[st] !== undefined) counts[st]++
    })
    return STAGES.map(name => ({ name, value: counts[name] || 0 })).filter(d => d.value > 0)
  }, [leads])

  const totalLeads = leads.length

  // ── Tasks filtering ───────────────────────────────────────────────────────
  const todayTasks = useMemo(() => {
    const today = todayStr()
    return tasks
      .filter(t => !t.completed && t.dueDate && t.dueDate <= today)
      .sort((a, b) => {
        const aOver = isOverdue(a.dueDate) ? 0 : 1
        const bOver = isOverdue(b.dueDate) ? 0 : 1
        if (aOver !== bOver) return aOver - bOver
        return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1)
      })
  }, [tasks])

  function handleAddTask(data) {
    addTask(data)
    setShowCreateTask(false)
  }

  // Custom center label for donut
  function DonutCenterLabel({ viewBox }) {
    const { cx, cy } = viewBox || {}
    return (
      <g>
        <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: 22, fontWeight: 800, fill: NAVY }}>
          {totalLeads}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }}>
          leads
        </text>
      </g>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      style={{
        padding: '28px 32px',
        minHeight: '100vh',
        background: '#F1F5F9',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 26,
          fontWeight: 800,
          color: NAVY,
          margin: 0,
          letterSpacing: '-0.02em',
        }}>
          Good morning, Nick 👋
        </h1>
        <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0', fontWeight: 400 }}>
          {todayLong()}
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard
          label="New Today"
          value={stats.newToday}
          accent="#EF4444"
          tag="NEW"
          subtitle="Submitted in last 24h"
        />
        <StatCard
          label="Need Contact"
          value={stats.needContact}
          accent="#F97316"
          tag="URGENT"
          subtitle="No outreach yet"
        />
        <StatCard
          label="Cold Leads"
          value={stats.coldLeads}
          accent="#3B82F6"
          tag="COLD"
          subtitle="Requires re-engagement"
        />
        <StatCard
          label="Pipeline Value"
          value={formatCurrency(stats.pipelineValue)}
          accent={GOLD}
          tag="PIPELINE"
          subtitle="Qualified + Active + In Progress"
        />
      </div>

      {/* ── Activity Feed + Tasks ── */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'flex-start' }}>

        {/* Activity Feed — 60% */}
        <div style={{
          flex: '0 0 60%',
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 2px 8px rgba(26,62,97,0.07), 0 1px 2px rgba(26,62,97,0.04)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px 12px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: NAVY, letterSpacing: '-0.01em' }}>
              Today's Activity
            </h2>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#94A3B8',
              textTransform: 'uppercase',
            }}>
              Live feed
            </span>
          </div>
          <div style={{ padding: '8px 8px' }}>
            {ACTIVITY_FEED.map((item, i) => (
              <ActivityItem
                key={i}
                item={item}
                onClick={() => navigate(`/people/${item.lead}`)}
              />
            ))}
          </div>
        </div>

        {/* Today's Tasks — 40% */}
        <div style={{
          flex: '0 0 calc(40% - 16px)',
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 2px 8px rgba(26,62,97,0.07), 0 1px 2px rgba(26,62,97,0.04)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px 12px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: NAVY, letterSpacing: '-0.01em' }}>
              Today's Tasks
              {todayTasks.length > 0 && (
                <span style={{
                  marginLeft: 8,
                  background: '#FEE2E2',
                  color: '#DC2626',
                  borderRadius: 20,
                  padding: '1px 8px',
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                  {todayTasks.length}
                </span>
              )}
            </h2>
            <button
              onClick={() => setShowCreateTask(v => !v)}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#fff',
                background: GOLD,
                border: 'none',
                borderRadius: 7,
                padding: '5px 13px',
                cursor: 'pointer',
              }}
            >
              + Create Task
            </button>
          </div>

          {showCreateTask && (
            <div style={{ padding: '0 16px' }}>
              <CreateTaskForm
                onAdd={handleAddTask}
                onCancel={() => setShowCreateTask(false)}
              />
            </div>
          )}

          <div style={{ padding: '10px 16px 16px' }}>
            {todayTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94A3B8' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>All caught up!</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>No overdue or due-today tasks.</div>
              </div>
            ) : (
              todayTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTask(task.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'flex', gap: 16 }}>

        {/* Bar Chart */}
        <div style={{
          flex: 1,
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 2px 8px rgba(26,62,97,0.07), 0 1px 2px rgba(26,62,97,0.04)',
          padding: '20px 20px 16px',
        }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: NAVY, letterSpacing: '-0.01em' }}>
              Lead Volume by Source
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#94A3B8' }}>All-time totals</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sourceChartData} margin={{ top: 4, right: 8, bottom: 28, left: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                angle={-28}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: '#F1F5F9' }} />
              <Bar dataKey="count" fill={GOLD} radius={[5, 5, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div style={{
          flex: 1,
          background: '#fff',
          borderRadius: 14,
          boxShadow: '0 2px 8px rgba(26,62,97,0.07), 0 1px 2px rgba(26,62,97,0.04)',
          padding: '20px 20px 16px',
        }}>
          <div style={{ marginBottom: 8 }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: NAVY, letterSpacing: '-0.01em' }}>
              Leads by Stage
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#94A3B8' }}>Current pipeline snapshot</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stageChartData}
                cx="50%"
                cy="44%"
                innerRadius={68}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
              >
                {stageChartData.map((entry) => (
                  <Cell key={entry.name} fill={STAGE_COLORS[entry.name] || '#CBD5E1'} />
                ))}
                <DonutCenterLabel />
              </Pie>
              <Tooltip content={<DonutTooltip />} />
              <Legend
                formatter={(value) => (
                  <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>{value}</span>
                )}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingTop: 4 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </motion.div>
  )
}
