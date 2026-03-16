import { useState } from 'react'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'
import Select from '../ui/Select.jsx'
import { getFullName } from '../../api/mockData.js'

const PRIORITIES = ['High', 'Medium', 'Low']

export default function TaskForm({ task = null, leads = [], onSave, onCancel }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    dueDate: task?.dueDate || '',
    priority: task?.priority || 'Medium',
    linkedLeadId: task?.linkedLeadId || '',
    notes: task?.notes || '',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      await onSave({
        ...form,
        linkedLeadId: form.linkedLeadId ? Number(form.linkedLeadId) : null,
      })
    } finally {
      setSaving(false)
    }
  }

  const leadOptions = leads.map(l => ({
    value: String(l.rowNumber),
    label: getFullName(l),
  }))

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">
      <Input
        label="Title"
        name="title"
        value={form.title}
        onChange={set('title')}
        placeholder="Follow up with..."
        required
        error={errors.title}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Due Date"
          name="dueDate"
          type="date"
          value={form.dueDate}
          onChange={set('dueDate')}
        />
        <Select
          label="Priority"
          name="priority"
          value={form.priority}
          onChange={set('priority')}
          options={PRIORITIES}
          placeholder={null}
        />
      </div>

      <Select
        label="Linked Lead"
        name="linkedLeadId"
        value={form.linkedLeadId}
        onChange={set('linkedLeadId')}
        options={leadOptions}
        placeholder="No lead linked"
      />

      <Input
        label="Notes"
        name="notes"
        value={form.notes}
        onChange={set('notes')}
        placeholder="Optional notes..."
      />

      <div className="flex gap-3 pt-1">
        {onCancel && (
          <Button variant="ghost" size="md" fullWidth type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button variant="gold" size="md" fullWidth type="submit" loading={saving}>
          {task ? 'Update Task' : 'Add Task'}
        </Button>
      </div>
    </form>
  )
}
