import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import { useState } from 'react'
import KanbanColumn from './KanbanColumn.jsx'
import KanbanCard from './KanbanCard.jsx'
import { getFullName } from '../../api/mockData.js'

const STATUSES = ['New', 'Contacted', 'Qualified', 'Closed', 'Lost']

export default function KanbanBoard({ leads, onLeadMove }) {
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const activeLead = activeId ? leads.find(l => String(l.rowNumber) === String(activeId)) : null

  const handleDragStart = ({ active }) => setActiveId(active.id)

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over) return
    const lead = leads.find(l => String(l.rowNumber) === String(active.id))
    if (!lead) return
    const targetStatus = over.id
    if (STATUSES.includes(targetStatus) && lead['Status'] !== targetStatus) {
      onLeadMove(lead.rowNumber, targetStatus)
    }
  }

  const handleDragCancel = () => setActiveId(null)

  const byStatus = STATUSES.reduce((acc, s) => {
    acc[s] = leads.filter(l => l['Status'] === s)
    return acc
  }, {})

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 h-full overflow-x-auto kanban-scroll pb-4 px-4 lg:px-6">
        {STATUSES.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            leads={byStatus[status] || []}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead && (
          <div className="rotate-2 shadow-floating">
            <KanbanCard lead={activeLead} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
