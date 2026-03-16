const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
  xl: 'p-8',
}

export default function Card({ children, padding = 'md', className = '', elevated = false, ...props }) {
  return (
    <div
      className={[
        'rounded-xl border border-gold/15',
        elevated ? 'bg-navy-800 shadow-card-lg' : 'bg-navy-800/80 shadow-card',
        PADDING[padding] || PADDING.md,
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
