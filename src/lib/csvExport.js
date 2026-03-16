import { getFullName } from '../api/mockData.js'

const CSV_HEADERS = [
  'Row #', 'Date', 'First Name', 'Last Name', 'Email', 'Phone', 'Zip Code',
  'Loan Type', 'VA Loan', 'Property Type', 'Credit Score', 'First Time Buyer',
  'Purchase Situation', 'Property Use', 'Purchase Price', 'Down Payment',
  'Rate Type', 'Annual Income', 'Employment Status', 'Bankruptcy',
  'Proof of Income', 'Real Estate Agent', 'How Found', 'Rebel Path Lead',
  'Rebel Path URL', 'Date Submitted', 'Time Submitted', 'Browser',
  'Submitted At', 'Status', 'Notes',
]

function escapeCSV(val) {
  const s = String(val ?? '').replace(/\n/g, '\\n')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function exportLeadsToCSV(leads, filename = 'leads.csv') {
  const rows = [CSV_HEADERS.join(',')]
  for (const l of leads) {
    const row = [
      l.rowNumber,
      l['Date'],
      l['First Name'],
      l['Last Name'],
      l['Email'],
      l['Phone'],
      l['Zip Code'],
      l['Loan Type'],
      l['VA Loan'],
      l['Property Type'],
      l['Credit Score'],
      l['First Time Buyer'],
      l['Purchase Situation'],
      l['Property Use'],
      l['Purchase Price'],
      l['Down Payment'],
      l['Rate Type'],
      l['Annual Income'],
      l['Employment Status'],
      l['Bankruptcy'],
      l['Proof of Income'],
      l['Real Estate Agent'],
      l['How Found'],
      l['Rebel Path Lead'],
      l['Rebel Path URL'],
      l['Date Submitted'],
      l['Time Submitted'],
      l['Browser'],
      l['Submitted At'],
      l['Status'],
      l['Notes'],
    ].map(escapeCSV).join(',')
    rows.push(row)
  }

  const csv = rows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
