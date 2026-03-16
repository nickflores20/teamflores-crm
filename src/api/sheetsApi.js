import { APPS_SCRIPT_URL, USE_MOCK } from './apiConfig.js'
import { MOCK_LEADS } from './mockData.js'

// Simulate a brief network delay for mock responses
const mockDelay = (ms = 400) => new Promise(res => setTimeout(res, ms))

/**
 * GET all leads from Google Sheets via Apps Script.
 * Returns array of lead objects with a rowNumber field on each.
 */
export async function getLeads() {
  if (USE_MOCK) {
    await mockDelay()
    return [...MOCK_LEADS]
  }

  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=getLeads`, {
      method: 'GET',
      mode: 'cors',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Apps Script returned failure')
    return data.leads || []
  } catch (err) {
    console.error('[sheetsApi] getLeads failed:', err)
    throw err
  }
}

/**
 * POST a new lead to Google Sheets.
 * Returns { success: true, rowNumber: N }
 */
export async function addLead(payload) {
  if (USE_MOCK) {
    await mockDelay(600)
    const newRowNumber = MOCK_LEADS.length + 2
    const now = new Date().toISOString()
    const newLead = {
      rowNumber: newRowNumber,
      'Date': now.slice(0, 10),
      'First Name': payload['First Name'] || '',
      'Last Name': payload['Last Name'] || '',
      'Email': payload['Email'] || '',
      'Phone': payload['Phone'] || '',
      'Zip Code': payload['Zip Code'] || '',
      'Loan Type': payload['Loan Type'] || '',
      'VA Loan': 'No',
      'Property Type': '',
      'Credit Score': '',
      'First Time Buyer': '',
      'Purchase Situation': '',
      'Property Use': '',
      'Purchase Price': payload['Purchase Price'] || '',
      'Down Payment': '',
      'Rate Type': '',
      'Annual Income': '',
      'Employment Status': '',
      'Bankruptcy': '',
      'Proof of Income': '',
      'Real Estate Agent': '',
      'How Found': payload['How Found'] || '',
      'Rebel Path Lead': 'No',
      'Rebel Path URL': '',
      'Date Submitted': now.slice(0, 10),
      'Time Submitted': new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      'Browser': 'CRM',
      'Submitted At': now,
      'Status': payload['Status'] || 'New',
      'Notes': payload['Notes'] || '',
    }
    return { success: true, rowNumber: newRowNumber, lead: newLead }
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'addLead', payload }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Add lead failed')
    return data
  } catch (err) {
    console.error('[sheetsApi] addLead failed:', err)
    throw err
  }
}

/**
 * POST an update to an existing lead row.
 * payload: { rowNumber, Status, Notes }
 * Returns { success: true }
 */
export async function updateLead(rowNumber, changes) {
  if (USE_MOCK) {
    await mockDelay(400)
    return { success: true }
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'updateLead',
        payload: { rowNumber, ...changes },
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Update lead failed')
    return data
  } catch (err) {
    console.error('[sheetsApi] updateLead failed:', err)
    throw err
  }
}
