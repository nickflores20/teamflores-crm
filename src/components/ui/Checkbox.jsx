export default function Checkbox({ checked, onChange, label, disabled = false, indeterminate = false, className = '' }) {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <span className="relative flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          ref={el => { if (el) el.indeterminate = indeterminate }}
          className="sr-only"
        />
        <span
          className={[
            'flex items-center justify-center w-4 h-4 rounded border transition-all duration-150',
            checked || indeterminate
              ? 'bg-gold border-gold'
              : 'bg-navy-900 border-white/20 hover:border-gold/50',
          ].join(' ')}
        >
          {indeterminate ? (
            <svg className="w-2.5 h-2.5 text-navy-900" fill="currentColor" viewBox="0 0 10 2">
              <rect width="10" height="2" rx="1" />
            </svg>
          ) : checked ? (
            <svg className="w-2.5 h-2.5 text-navy-900" fill="none" viewBox="0 0 12 10">
              <path d="M1 5l3.5 4L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : null}
        </span>
      </span>
      {label && <span className="text-sm text-sand/80">{label}</span>}
    </label>
  )
}
