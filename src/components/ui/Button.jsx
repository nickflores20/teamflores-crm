import { motion } from 'framer-motion'

const variants = {
  gold:   'bg-gold hover:bg-gold-light active:bg-gold-dark text-white font-semibold shadow-sm',
  navy:   'bg-navy-800 hover:bg-navy-700 active:bg-navy-900 text-white font-semibold',
  ghost:  'bg-white hover:bg-surface-secondary active:bg-surface-tertiary text-ink-secondary border border-surface-border hover:border-surface-border-strong font-medium',
  danger: 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-semibold shadow-sm',
  link:   'bg-transparent text-gold hover:text-gold-dark underline-offset-2 hover:underline font-medium p-0',
}

const sizes = {
  xs: 'px-2.5 py-1 text-xs rounded-md',
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-2.5 text-base rounded-lg',
  xl: 'px-7 py-3 text-base rounded-xl',
}

export default function Button({
  variant = 'gold',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  iconRight = null,
  fullWidth = false,
  className = '',
  children,
  onClick,
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.1 }}
      className={[
        'inline-flex items-center justify-center gap-2 transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2',
        variants[variant] || variants.gold,
        sizes[size] || sizes.md,
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        variant !== 'link' ? 'select-none' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon}
      {children && <span>{children}</span>}
      {!loading && iconRight}
    </motion.button>
  )
}
