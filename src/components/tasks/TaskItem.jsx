import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Checkbox from '../ui/Checkbox.jsx'
import { formatDate, isPast, isToday } from '../../lib/dateUtils.js'
import { getFullName } from '../../api/mockData.js'
import { useLeadsContext } from '../../context/LeadsContext.jsx'

const PRIORITY_STYLES = {
  High:   'bg-red-100 text-red-700 border-red-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low:    'bg-slate-100 text-slate-500 border-slate-200',
}

export default function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const navigate = useNavigate()
  const { leads } = useLeadsContext()

  const linkedLead = task.linkedLeadId
    ? leads.find(l => String(l.rowNumber) === String(task.linkedLeadId))
    : null

  const isOverdue  = task.dueDate && !task.completed && isPast(task.dueDate) && !isToday(task.dueDate)
  const isDueToday = task.dueDate && !task.completed && isToday(task.dueDate)

  // Due date pill style
  const duePillStyle = isOverdue
    ? 'bg-red-100 text-red-700 border border-red-200'
    : isDueToday
      ? 'bg-amber-100 text-amber-700 border border-amber-200'
      : 'bg-slate-100 text-slate-500 border border-slate-200'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={[
        'flex items-start gap-3 px-4 lg:px-6 py-3.5 border-b border-surface-border group transition-colors',
        task.completed ? 'opacity-50 bg-white' : isOverdue ? 'bg-red-50/50' : 'bg-white hover:bg-surface-secondary',
      ].filter(Boolean).join(' ')}
    >
      <Checkbox
        checked={task.completed}
        onChange={onToggle}
        className="mt-0.5 flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${task.completed ? 'line-through text-ink-muted' : 'text-ink'}`}>
          {task.title}
        </p>

        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {/* Priority badge */}
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium}`}>
            {task.priority}
          </span>

          {/* Due date pill */}
          {task.dueDate && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${duePillStyle}`}>
              {isOverdue ? '⚠ Overdue · ' : isDueToday ? 'Today · ' : ''}{formatDate(task.dueDate)}
            </span>
          )}

          {/* Linked lead */}
          {linkedLead && (
            <button
              onClick={() => navigate(`/people/${linkedLead.rowNumber}`)}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium"
            >
              {getFullName(linkedLead)}
            </button>
          )}
        </div>

        {task.notes && (
          <p className="text-xs text-ink-muted mt-1 truncate">{task.notes}</p>
        )}
      </div>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-tertiary transition-colors"
          aria-label="Edit task"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors"
          aria-label="Delete task"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}
