import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import { useState } from 'react'
import KanbanColumn from './KanbanColumn.jsx'
import KanbanCard from './KanbanCard.jsx'
import { getFullName } from '../../api/mockData.js'

// Mortgage-specific deal pipeline stages (left→right)
export const DEAL_STAGES = [
  'Inquiry',
  'Sonar Sent',
  'Pre-Approval In Progress',
  'Pre-Approved',
  'Under Contract',
  'In Underwriting',
  'Clear to Close',
  'Closed Won',
]

// Map CRM lead stages to deal pipeline stages
export const STAGE_TO_DEAL = {
  'New':         'Inquiry',
  'Contacted':   'Inquiry',
  'Active':      'Inquiry',
  'Qualified':   'Pre-Approved',
  'In Progress': 'In Underwriting',
  'Closed Won':  'Closed Won',
  'Cold':        'Inquiry',
  'Dead':        null, // excluded from board
}

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
    // Map deal stage back to CRM stage
    const dealStage = over.id
    if (DEAL_STAGES.includes(dealStage)) {
      // Determine new CRM status from deal stage
      let newStatus = lead['Status']
      if (dealStage === 'Inquiry') newStatus = lead['Status'] || 'New'
      else if (dealStage === 'Sonar Sent') newStatus = 'Contacted'
      else if (dealStage === 'Pre-Approval In Progress') newStatus = 'Qualified'
      else if (dealStage === 'Pre-Approved') newStatus = 'Qualified'
      else if (dealStage === 'Under Contract') newStatus = 'Qualified'
      else if (dealStage === 'In Underwriting') newStatus = 'In Progress'
      else if (dealStage === 'Clear to Close') newStatus = 'In Progress'
      else if (dealStage === 'Closed Won') newStatus = 'Closed Won'

      if (newStatus !== lead['Status']) {
        onLeadMove(lead.rowNumber, newStatus)
      }
    }
  }

  const handleDragCancel = () => setActiveId(null)

  // Exclude Dead leads from the board; map others to deal stages
  const boardLeads = leads.filter(l => l['Status'] !== 'Dead')

  const byStage = DEAL_STAGES.reduce((acc, s) => {
    acc[s] = boardLeads.filter(l => {
      const mapped = STAGE_TO_DEAL[l['Status']]
      return mapped === s
    })
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
        {DEAL_STAGES.map(stage => (
          <KanbanColumn
            key={stage}
            status={stage}
            leads={byStage[stage] || []}
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
