import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTasks } from '../hooks/useTasks.js'
import { useLeadsContext } from '../context/LeadsContext.jsx'
import TaskItem from '../components/tasks/TaskItem.jsx'
import Modal from '../components/ui/Modal.jsx'
import TaskForm from '../components/tasks/TaskForm.jsx'
import { getFullName } from '../api/mockData.js'

const TABS = [
  { id: 'all',       label: 'All' },
  { id: 'today',     label: 'Due Today' },
  { id: 'overdue',   label: 'Overdue' },
  { id: 'upcoming',  label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
]

const PRIORITIES = ['High', 'Medium', 'Low']

const BASE_INPUT = 'w-full border border-surface-border rounded-lg px-3 py-2 text-sm text-ink placeholder-ink-muted bg-white focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/60 transition-colors'
const BASE_SELECT = 'border border-surface-border rounded-lg px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/60 transition-colors'

export default function Tasks() {
  const [activeTab, setActiveTab]   = useState('all')
  const [editTask, setEditTask]     = useState(null)
  const { tasks, counts, addTask, updateTask, deleteTask, toggleTask } = useTasks(activeTab)
  const { leads } = useLeadsContext()

  // Inline add-form state
  const [title,        setTitle]        = useState('')
  const [dueDate,      setDueDate]      = useState('')
  const [priority,     setPriority]     = useState('Medium')
  const [linkedLeadId, setLinkedLeadId] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    addTask({
      title: title.trim(),
      dueDate,
      priority,
      linkedLeadId: linkedLeadId ? Number(linkedLeadId) : null,
    })
    setTitle('')
    setDueDate('')
    setPriority('Medium')
    setLinkedLeadId('')
  }

  const handleEdit = (formData) => {
    updateTask(editTask.id, formData)
    setEditTask(null)
  }

  const leadOptions = leads.map(l => ({
    value: String(l.rowNumber),
    label: getFullName(l),
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col h-full bg-white"
    >
      {/* ── Inline Add Form ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-b border-surface-border bg-surface-secondary px-4 lg:px-6 py-4">
        <form onSubmit={handleAdd} className="space-y-2">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Add a new task…"
            className={BASE_INPUT}
          />
          <div className="flex gap-2 flex-wrap">
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className={`${BASE_SELECT} flex-1 min-w-[130px]`}
            />
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className={`${BASE_SELECT} flex-1 min-w-[110px]`}
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              value={linkedLeadId}
              onChange={e => setLinkedLeadId(e.target.value)}
              className={`${BASE_SELECT} flex-1 min-w-[160px]`}
            >
              <option value="">Link to lead…</option>
              {leadOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 transition-opacity whitespace-nowrap"
              style={{ backgroundColor: '#C6A76F' }}
            >
              Add Task
            </button>
          </div>
        </form>
      </div>

      {/* ── Filter Tabs ──────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex gap-1 overflow-x-auto px-4 lg:px-6 py-3 border-b border-surface-border bg-white">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-navy-800/10 text-navy-800'
                : 'text-ink-secondary hover:text-ink hover:bg-surface-secondary',
            ].join(' ')}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                  activeTab === tab.id
                    ? 'bg-navy-800 text-white'
                    : 'bg-surface-tertiary text-ink-secondary'
                }`}
              >
                {counts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Task list ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-ink-muted"
            >
              <svg className="w-10 h-10 mb-3 text-surface-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">No tasks here</p>
            </motion.div>
          ) : (
            tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
                onDelete={() => deleteTask(task.id)}
                onEdit={() => setEditTask(task)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* ── Edit modal ───────────────────────────────────────────────────── */}
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
