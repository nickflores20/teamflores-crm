import { createContext, useContext, useState, useCallback } from 'react'
import { USE_MOCK } from '../api/apiConfig.js'
import { demoTasks } from '../api/demoSeed.js'

const STORAGE_KEY = 'tf_tasks'

const TasksContext = createContext(null)

function loadTasks() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (stored.length === 0 && USE_MOCK) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoTasks))
      return demoTasks
    }
    return stored
  } catch {
    if (USE_MOCK) return demoTasks
    return []
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState(loadTasks)

  const updateAndSave = useCallback((updater) => {
    setTasks(prev => {
      const next = updater(prev)
      saveTasks(next)
      return next
    })
  }, [])

  const addTask = useCallback((task) => {
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: task.title || '',
      dueDate: task.dueDate || '',
      priority: task.priority || 'Medium',
      linkedLeadId: task.linkedLeadId || null,
      notes: task.notes || '',
      completed: false,
      createdAt: new Date().toISOString(),
    }
    updateAndSave(prev => [newTask, ...prev])
    return newTask
  }, [updateAndSave])

  const updateTask = useCallback((id, changes) => {
    updateAndSave(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t))
  }, [updateAndSave])

  const deleteTask = useCallback((id) => {
    updateAndSave(prev => prev.filter(t => t.id !== id))
  }, [updateAndSave])

  const toggleTask = useCallback((id) => {
    updateAndSave(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
  }, [updateAndSave])

  return (
    <TasksContext.Provider value={{ tasks, addTask, updateTask, deleteTask, toggleTask }}>
      {children}
    </TasksContext.Provider>
  )
}

export function useTasksContext() {
  const ctx = useContext(TasksContext)
  if (!ctx) throw new Error('useTasksContext must be used within TasksProvider')
  return ctx
}
