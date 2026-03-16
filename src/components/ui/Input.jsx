export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-xs font-semibold text-ink-secondary">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={[
          'w-full bg-white border rounded-lg px-3 py-2 text-ink placeholder-ink-muted text-sm',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/60',
          error ? 'border-red-400' : 'border-surface-border hover:border-surface-border-strong',
          disabled ? 'opacity-50 cursor-not-allowed bg-surface-secondary' : '',
          inputClassName,
        ].filter(Boolean).join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
}
