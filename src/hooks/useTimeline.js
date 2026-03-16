import { useState, useCallback, useEffect } from 'react'

export function useTimeline(rowNumber) {
  const key = `crm_timeline_${rowNumber}`

  const [events, setEvents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(events))
    } catch {
      // localStorage full or unavailable
    }
  }, [key, events])

  const addEvent = useCallback(
    (eventData) => {
      const newEvent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        leadRowNumber: rowNumber,
        timestamp: new Date().toISOString(),
        createdBy: 'Nick Flores',
        ...eventData,
        preview:
          eventData.preview ??
          (eventData.body ? String(eventData.body).slice(0, 100) : ''),
      }
      setEvents((prev) => [...prev, newEvent])
      return newEvent
    },
    [rowNumber]
  )

  // Bulk-add events (used for auto-generating demo history)
  const bulkAdd = useCallback(
    (eventsArray) => {
      const newEvents = eventsArray.map((e, i) => ({
        id: `gen-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
        leadRowNumber: rowNumber,
        createdBy: 'Nick Flores',
        timestamp: new Date().toISOString(),
        ...e,
        preview: e.preview ?? (e.body ? String(e.body).slice(0, 100) : ''),
      }))
      setEvents((prev) => [...prev, ...newEvents])
    },
    [rowNumber]
  )

  const editEvent = useCallback((id, changes) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e
        const updated = { ...e, ...changes }
        if (changes.body && !changes.preview) {
          updated.preview = String(changes.body).slice(0, 100)
        }
        return updated
      })
    )
  }, [])

  const deleteEvent = useCallback((id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return { events, addEvent, bulkAdd, editEvent, deleteEvent }
}
