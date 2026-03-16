import { useMemo } from 'react'
import { useTasksContext } from '../context/TasksContext.jsx'

export function useTasks(filter = 'all') {
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useTasksContext()

  const today = new Date().toISOString().slice(0, 10)

  // Sort: overdue first, then today, then upcoming, completed at bottom
  const sorted = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const rank = (t) => {
        if (t.completed) return 4
        if (!t.dueDate) return 3
        if (t.dueDate < today) return 0  // overdue
        if (t.dueDate === today) return 1  // today
        return 2  // upcoming
      }
      const ra = rank(a)
      const rb = rank(b)
      if (ra !== rb) return ra - rb
      // Within same rank: sort by dueDate ascending (then createdAt)
      if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) {
        return a.dueDate < b.dueDate ? -1 : 1
      }
      return new Date(a.createdAt) - new Date(b.createdAt)
    })
  }, [tasks, today])

  const filtered = useMemo(() => {
    switch (filter) {
      case 'today':
        return sorted.filter(t => !t.completed && t.dueDate === today)
      case 'overdue':
        return sorted.filter(t => !t.completed && t.dueDate && t.dueDate < today)
      case 'upcoming':
        return sorted.filter(t => !t.completed && (!t.dueDate || t.dueDate > today))
      case 'completed':
        return sorted.filter(t => t.completed)
      default:
        return sorted
    }
  }, [sorted, filter, today])

  const counts = useMemo(() => ({
    all:       tasks.length,
    today:     tasks.filter(t => !t.completed && t.dueDate === today).length,
    overdue:   tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today).length,
    upcoming:  tasks.filter(t => !t.completed && (!t.dueDate || t.dueDate > today)).length,
    completed: tasks.filter(t => t.completed).length,
  }), [tasks, today])

  return { tasks: filtered, allTasks: tasks, counts, addTask, updateTask, deleteTask, toggleTask }
}
