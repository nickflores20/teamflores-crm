export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  error,
  required = false,
  disabled = false,
  className = '',
  selectClassName = '',
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-xs font-semibold text-ink-secondary">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={[
          'w-full bg-white border rounded-lg px-3 py-2 text-ink text-sm',
          'transition-colors duration-150 appearance-none',
          'focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/60',
          error ? 'border-red-400' : 'border-surface-border hover:border-surface-border-strong',
          disabled ? 'opacity-50 cursor-not-allowed bg-surface-secondary' : 'cursor-pointer',
          selectClassName,
        ].filter(Boolean).join(' ')}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          paddingRight: '2.25rem',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
}
