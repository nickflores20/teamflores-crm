import { useState } from 'react'
import { useLeadsContext } from '../../context/LeadsContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import Modal from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'
import Select from '../ui/Select.jsx'
import Button from '../ui/Button.jsx'
import { todayISO } from '../../lib/dateUtils.js'

const LOAN_TYPES     = ['Conventional', 'FHA', 'VA', 'USDA', 'Jumbo', 'Other']
const PROPERTY_TYPES = ['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Other']
const RATE_TYPES     = ['Fixed', 'ARM']
const PROPERTY_USES  = ['Primary Residence', 'Second Home', 'Investment Property']
const EMP_STATUSES   = ['Employed', 'Self-Employed', 'Retired', 'Unemployed', 'Other']
const PURCHASE_SITS  = ['Ready to Buy', 'Just Starting', 'Within 3 Months', 'Within 6 Months', 'Just Looking']
const YES_NO         = ['Yes', 'No']
const CREDIT_RANGES  = ['Below 580', '580-619', '620-659', '660-699', '700-719', '720-759', '760+']
const HOW_FOUND      = ['Google', 'Facebook', 'Instagram', 'Referral', 'Direct', 'Zillow', 'Realtor.com', 'Other']

const INITIAL = {
  'First Name': '',
  'Last Name': '',
  'Email': '',
  'Phone': '',
  'Zip Code': '',
  'Loan Type': '',
  'VA Loan': 'No',
  'Property Type': '',
  'Credit Score': '',
  'First Time Buyer': 'No',
  'Purchase Situation': '',
  'Property Use': 'Primary Residence',
  'Purchase Price': '',
  'Down Payment': '',
  'Rate Type': 'Fixed',
  'Annual Income': '',
  'Employment Status': 'Employed',
  'Bankruptcy': 'No',
  'Proof of Income': 'No',
  'Real Estate Agent': 'No',
  'How Found': '',
  'Notes': '',
  'Status': 'New',
}

function SectionHeader({ children }) {
  return (
    <div className="flex items-center gap-3 -mx-1">
      <span className="text-xs font-semibold uppercase tracking-widest text-gold/70">{children}</span>
      <div className="flex-1 h-px bg-white/8" />
    </div>
  )
}

export default function QuickAddLeadModal({ isOpen, onClose }) {
  const { addLead } = useLeadsContext()
  const { addToast } = useToast()
  const [form, setForm] = useState(INITIAL)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [tab, setTab] = useState('contact') // 'contact' | 'loan' | 'profile'

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form['First Name'].trim()) errs['First Name'] = 'Required'
    if (!form['Last Name'].trim()) errs['Last Name'] = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) { setTab('contact'); return }
    setSaving(true)
    try {
      await addLead({
        ...form,
        Date: todayISO(),
        'Date Submitted': todayISO(),
        'Submitted At': new Date().toISOString(),
      })
      addToast({ type: 'success', message: `${form['First Name']} ${form['Last Name']} added` })
      setForm(INITIAL)
      setErrors({})
      setTab('contact')
      onClose()
    } catch {
      addToast({ type: 'error', message: 'Failed to add lead' })
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setForm(INITIAL)
    setErrors({})
    setTab('contact')
    onClose()
  }

  const TABS = [
    { id: 'contact', label: 'Contact' },
    { id: 'loan',    label: 'Loan' },
    { id: 'profile', label: 'Profile' },
  ]

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Lead" size="lg">
      {/* Tab nav */}
      <div className="flex border-b border-white/8 px-5">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              tab === t.id
                ? 'border-gold text-gold'
                : 'border-transparent text-sand/40 hover:text-sand/70',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="px-5 py-5 space-y-4">

          {/* ── Contact ── */}
          {tab === 'contact' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name" value={form['First Name']} onChange={set('First Name')} placeholder="Marcus" required error={errors['First Name']} />
                <Input label="Last Name"  value={form['Last Name']}  onChange={set('Last Name')}  placeholder="Rivera"  required error={errors['Last Name']} />
              </div>
              <Input label="Email" type="email" value={form['Email']} onChange={set('Email')} placeholder="email@example.com" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Phone"    value={form['Phone']}    onChange={set('Phone')}    placeholder="702-555-0100" />
                <Input label="Zip Code" value={form['Zip Code']} onChange={set('Zip Code')} placeholder="89101" />
              </div>
              <Select
                label="How Found"
                value={form['How Found']}
                onChange={set('How Found')}
                options={HOW_FOUND}
                placeholder="Select source"
              />
              <div>
                <label className="text-xs font-medium text-sand/60 block mb-1.5">Notes</label>
                <textarea
                  value={form['Notes']}
                  onChange={set('Notes')}
                  placeholder="Any initial notes..."
                  rows={3}
                  className="w-full bg-navy-950/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-sand placeholder:text-sand/25 focus:outline-none focus:border-gold/40 resize-none"
                />
              </div>
            </>
          )}

          {/* ── Loan ── */}
          {tab === 'loan' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Select label="Loan Type"      value={form['Loan Type']}      onChange={set('Loan Type')}      options={LOAN_TYPES}     placeholder="Select type" />
                <Select label="Rate Type"      value={form['Rate Type']}      onChange={set('Rate Type')}      options={RATE_TYPES}     placeholder={null} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input  label="Purchase Price" value={form['Purchase Price']} onChange={set('Purchase Price')} placeholder="385000" />
                <Input  label="Down Payment"   value={form['Down Payment']}   onChange={set('Down Payment')}   placeholder="77000" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select label="Property Type"  value={form['Property Type']}  onChange={set('Property Type')}  options={PROPERTY_TYPES} placeholder="Select type" />
                <Select label="Property Use"   value={form['Property Use']}   onChange={set('Property Use')}   options={PROPERTY_USES}  placeholder={null} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select label="VA Loan"        value={form['VA Loan']}        onChange={set('VA Loan')}        options={YES_NO}         placeholder={null} />
                <Select label="Purchase Situation" value={form['Purchase Situation']} onChange={set('Purchase Situation')} options={PURCHASE_SITS} placeholder="Select" />
              </div>
            </>
          )}

          {/* ── Profile ── */}
          {tab === 'profile' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Select label="Credit Score"      value={form['Credit Score']}      onChange={set('Credit Score')}      options={CREDIT_RANGES} placeholder="Select range" />
                <Select label="First Time Buyer"  value={form['First Time Buyer']}  onChange={set('First Time Buyer')}  options={YES_NO}        placeholder={null} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input  label="Annual Income"     value={form['Annual Income']}     onChange={set('Annual Income')}     placeholder="95000" />
                <Select label="Employment Status" value={form['Employment Status']} onChange={set('Employment Status')} options={EMP_STATUSES}  placeholder="Select" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select label="Bankruptcy"        value={form['Bankruptcy']}        onChange={set('Bankruptcy')}        options={YES_NO}        placeholder={null} />
                <Select label="Proof of Income"   value={form['Proof of Income']}   onChange={set('Proof of Income')}   options={YES_NO}        placeholder={null} />
              </div>
              <Select label="Real Estate Agent" value={form['Real Estate Agent']} onChange={set('Real Estate Agent')} options={YES_NO} placeholder={null} />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 pb-5 pt-1">
          <div className="flex gap-2">
            {TABS.map((t, i) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-2 h-2 rounded-full transition-colors ${tab === t.id ? 'bg-gold' : 'bg-white/15'}`}
              />
            ))}
          </div>
          <div className="flex gap-3">
            {tab !== 'contact' && (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setTab(tab === 'profile' ? 'loan' : 'contact')}
              >
                Back
              </Button>
            )}
            {tab !== 'profile' ? (
              <Button
                type="button"
                variant="gold"
                size="md"
                onClick={() => {
                  if (tab === 'contact') { if (validate()) setTab('loan') }
                  else setTab('profile')
                }}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" variant="gold" size="md" loading={saving}>
                Add Lead
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  )
}
