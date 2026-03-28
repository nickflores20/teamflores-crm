import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTasks } from '../hooks/useTasks.js'
import { useLeadsContext } from '../context/LeadsContext.jsx'
import Modal from '../components/ui/Modal.jsx'
import TaskForm from '../components/tasks/TaskForm.jsx'
import { getFullName } from '../api/mockData.js'

const NAVY = '#1A3E61'
const GOLD = '#C6A76F'

const PRIORITY_STYLES = {
  High:   { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' },
  Medium: { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
  Low:    { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' },
}

function formatDue(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function TaskCard({ task, onToggle, onDelete, onEdit, isOverdue }) {
  const navigate = useNavigate()
  const { leads } = useLeadsContext()
  const [hovered, setHovered] = useState(false)

  const linkedLead = task.linkedLeadId
    ? leads.find(l => l.rowNumber === task.linkedLeadId || l.rowNumber === Number(task.linkedLeadId))
    : null
  const leadName = linkedLead ? getFullName(linkedLead) : null
  const pri = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Low

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: task.completed ? 40 : -10, transition: { duration: 0.2 } }}
      className="flex items-start gap-3 px-4 py-3 bg-white border-b border-slate-100 group relative"
      style={isOverdue ? { borderLeft: '3px solid #EF4444' } : { borderLeft: '3px solid transparent' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
        style={task.completed
          ? { backgroundColor: '#22C55E', borderColor: '#22C55E' }
          : { borderColor: '#CBD5E1', backgroundColor: 'white' }
        }
      >
        {task.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <span
            className={`text-sm font-semibold leading-snug ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}
          >
            {task.title}
          </span>
          {/* Priority badge */}
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: pri.bg, color: pri.text, border: `1px solid ${pri.border}` }}
          >
            {task.priority}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {/* Linked lead */}
          {leadName && (
            <button
              onClick={() => navigate(`/people/${task.linkedLeadId}`)}
              className="text-xs font-semibold hover:underline"
              style={{ color: GOLD }}
            >
              {leadName}
            </button>
          )}
          {/* Due date */}
          {task.dueDate && (
            <span
              className="text-xs font-medium"
              style={{ color: isOverdue ? '#DC2626' : '#64748B' }}
            >
              {isOverdue ? '⚠ Overdue · ' : ''}{formatDue(task.dueDate)}
            </span>
          )}
          {/* Notes */}
          {task.notes && (
            <span className="text-xs text-slate-400 truncate max-w-[200px]">{task.notes}</span>
          )}
        </div>
      </div>

      {/* Hover actions */}
      <div
        className="flex items-center gap-1 flex-shrink-0 transition-opacity"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Edit"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}

function SectionHeader({ label, count, color, collapsed, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/50 transition-colors"
      style={{ backgroundColor: color + '10' }}
    >
      <svg
        className="w-3.5 h-3.5 transition-transform flex-shrink-0"
        style={{ color, transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
        {label}
      </span>
      <span
        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
        style={{ backgroundColor: color, color: 'white' }}
      >
        {count}
      </span>
    </button>
  )
}

const BASE_INPUT = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-colors'
const BASE_SELECT = 'border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-colors'

export default function Tasks() {
  const { tasks, counts, addTask, updateTask, deleteTask, toggleTask } = useTasks('all')
  const { leads } = useLeadsContext()
  const [editTask, setEditTask] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [collapsed, setCollapsed] = useState({ overdue: false, today: false, upcoming: false, completed: true })

  // Quick add inline form
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [linkedLeadId, setLinkedLeadId] = useState('')

  const today = new Date().toISOString().slice(0, 10)

  const overdue   = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today)
  const todayTasks = tasks.filter(t => !t.completed && t.dueDate === today)
  const upcoming  = tasks.filter(t => !t.completed && (!t.dueDate || t.dueDate > today))
  const completed = tasks.filter(t => t.completed)

  const leadOptions = leads.map(l => ({ value: String(l.rowNumber), label: getFullName(l) }))

  const handleAdd = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    addTask({ title: title.trim(), dueDate, priority, linkedLeadId: linkedLeadId ? Number(linkedLeadId) : null })
    setTitle(''); setDueDate(''); setPriority('Medium'); setLinkedLeadId('')
  }

  const handleEdit = (formData) => {
    updateTask(editTask.id, formData)
    setEditTask(null)
  }

  const toggleSection = (key) => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }))

  const renderSection = (label, sectionTasks, color, key, isOverdue = false) => (
    <div key={key} className="flex flex-col">
      <SectionHeader
        label={label}
        count={sectionTasks.length}
        color={color}
        collapsed={collapsed[key]}
        onToggle={() => toggleSection(key)}
      />
      <AnimatePresence>
        {!collapsed[key] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {sectionTasks.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-400 bg-white border-b border-slate-100">
                {key === 'overdue' ? 'No overdue tasks 🎉' : key === 'today' ? 'Nothing due today' : key === 'completed' ? 'No completed tasks yet' : 'No upcoming tasks'}
              </div>
            ) : (
              <AnimatePresence>
                {sectionTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isOverdue={isOverdue && !task.completed}
                    onToggle={() => toggleTask(task.id)}
                    onDelete={() => deleteTask(task.id)}
                    onEdit={() => setEditTask(task)}
                  />
                ))}
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col h-full bg-slate-50"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-slate-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-serif font-semibold" style={{ color: NAVY }}>Tasks</h1>
          {counts.overdue > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
              {counts.overdue} overdue
            </span>
          )}
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: GOLD }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Task
        </button>
      </div>

      {/* Quick add inline */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-white px-4 lg:px-6 py-3">
        <form onSubmit={handleAdd} className="flex gap-2 flex-wrap items-end">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Quick add: type task title and press Enter…"
              className={BASE_INPUT}
              style={{ minHeight: '38px' }}
            />
          </div>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className={`${BASE_SELECT} flex-shrink-0`}
            style={{ minWidth: '140px' }}
          />
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className={`${BASE_SELECT} flex-shrink-0`}
            style={{ minWidth: '110px' }}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={linkedLeadId}
            onChange={e => setLinkedLeadId(e.target.value)}
            className={`${BASE_SELECT} flex-shrink-0`}
            style={{ minWidth: '160px' }}
          >
            <option value="">Link to lead…</option>
            {leadOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: NAVY, minHeight: '38px' }}
          >
            Add
          </button>
        </form>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto">
        {/* OVERDUE */}
        {renderSection('Overdue', overdue, '#EF4444', 'overdue', true)}

        {/* TODAY */}
        {renderSection('Due Today', todayTasks, '#F97316', 'today')}

        {/* UPCOMING */}
        {renderSection('Upcoming', upcoming, NAVY, 'upcoming')}

        {/* COMPLETED */}
        {renderSection('Completed', completed, '#94A3B8', 'completed')}
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Task" size="sm">
        <TaskForm
          task={null}
          leads={leads}
          onSave={(data) => { addTask(data); setCreateOpen(false) }}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" size="sm">
        {editTask && (
          <TaskForm
            task={editTask}
            leads={leads}
            onSave={handleEdit}
            onCancel={() => setEditTask(null)}
          />
        )}
      </Modal>
    </motion.div>
  )
}
