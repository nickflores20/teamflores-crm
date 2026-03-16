import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { getLeads, addLead as apiAddLead, updateLead as apiUpdateLead } from '../api/sheetsApi.js'
import { getFullName } from '../api/mockData.js'

const LeadsContext = createContext(null)

export { getFullName }

export function LeadsProvider({ children }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFetched, setLastFetched] = useState(null)
  const [pendingUpdates, setPendingUpdates] = useState(new Set())
  const fetchingRef = useRef(false)

  const fetchLeads = useCallback(async (force = false) => {
    if (fetchingRef.current && !force) return
    fetchingRef.current = true
    setLoading(true)
    setError(null)
    try {
      const data = await getLeads()
      setLeads(data)
      setLastFetched(Date.now())
    } catch (err) {
      setError('Failed to load leads. Check your connection.')
      console.error('[LeadsContext] fetchLeads error:', err)
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [])

  const addLead = useCallback(async (formData) => {
    const tempId = `temp-${Date.now()}`
    const now = new Date().toISOString()
    const optimistic = {
      rowNumber: tempId,
      'Date': now.slice(0, 10),
      'First Name': formData['First Name'] || '',
      'Last Name': formData['Last Name'] || '',
      'Email': formData['Email'] || '',
      'Phone': formData['Phone'] || '',
      'Zip Code': formData['Zip Code'] || '',
      'Loan Type': formData['Loan Type'] || '',
      'VA Loan': 'No',
      'Property Type': '',
      'Credit Score': '',
      'First Time Buyer': '',
      'Purchase Situation': '',
      'Property Use': '',
      'Purchase Price': formData['Purchase Price'] || '',
      'Down Payment': '',
      'Rate Type': '',
      'Annual Income': '',
      'Employment Status': '',
      'Bankruptcy': '',
      'Proof of Income': '',
      'Real Estate Agent': '',
      'How Found': formData['How Found'] || '',
      'Rebel Path Lead': 'No',
      'Rebel Path URL': '',
      'Date Submitted': now.slice(0, 10),
      'Time Submitted': new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      'Browser': 'CRM',
      'Submitted At': now,
      'Status': formData['Status'] || 'New',
      'Notes': formData['Notes'] || '',
    }

    setLeads(prev => [optimistic, ...prev])

    try {
      const result = await apiAddLead(formData)
      if (result.success) {
        const finalLead = result.lead || { ...optimistic, rowNumber: result.rowNumber }
        setLeads(prev => prev.map(l => l.rowNumber === tempId ? finalLead : l))
        return finalLead
      }
      throw new Error('Server returned failure')
    } catch (err) {
      setLeads(prev => prev.filter(l => l.rowNumber !== tempId))
      throw err
    }
  }, [])

  const updateLead = useCallback(async (rowNumber, changes) => {
    const prev = leads.find(l => l.rowNumber === rowNumber)
    if (!prev) throw new Error('Lead not found')

    setPendingUpdates(s => new Set([...s, rowNumber]))

    const optimistic = { ...prev, ...changes, 'Submitted At': new Date().toISOString() }
    setLeads(prevLeads => prevLeads.map(l => l.rowNumber === rowNumber ? optimistic : l))

    try {
      await apiUpdateLead(rowNumber, changes)
    } catch (err) {
      setLeads(prevLeads => prevLeads.map(l => l.rowNumber === rowNumber ? prev : l))
      throw err
    } finally {
      setPendingUpdates(s => { const n = new Set(s); n.delete(rowNumber); return n })
    }
  }, [leads])

  const setLeadStatus = useCallback(async (rowNumber, status) => {
    const lead = leads.find(l => l.rowNumber === rowNumber)
    if (!lead) return
    const now = new Date().toISOString()
    const statusNote = `[${now.slice(0, 10)} ${now.slice(11, 16)}] Status changed to ${status}.`
    const existingNotes = lead['Notes'] || ''
    const updatedNotes = existingNotes ? `${statusNote}\n${existingNotes}` : statusNote
    return updateLead(rowNumber, { 'Status': status, 'Notes': updatedNotes })
  }, [leads, updateLead])

  const addNote = useCallback(async (rowNumber, noteText) => {
    const lead = leads.find(l => l.rowNumber === rowNumber)
    if (!lead) return
    const now = new Date().toISOString()
    const timestamp = `${now.slice(0, 10)} ${now.slice(11, 16)}`
    const newNote = `[${timestamp}] ${noteText}`
    const existingNotes = lead['Notes'] || ''
    const updatedNotes = existingNotes ? `${newNote}\n${existingNotes}` : newNote
    return updateLead(rowNumber, { 'Notes': updatedNotes })
  }, [leads, updateLead])

  return (
    <LeadsContext.Provider value={{
      leads, loading, error, lastFetched, pendingUpdates,
      fetchLeads, addLead, updateLead, setLeadStatus, addNote,
    }}>
      {children}
    </LeadsContext.Provider>
  )
}

export function useLeadsContext() {
  const ctx = useContext(LeadsContext)
  if (!ctx) throw new Error('useLeadsContext must be used within LeadsProvider')
  return ctx
}
