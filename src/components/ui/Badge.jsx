const STATUS_STYLES = {
  New:       'bg-gray-100 text-gray-600 border-gray-200',
  Contacted: 'bg-blue-50 text-blue-600 border-blue-200',
  Qualified: 'bg-amber-50 text-amber-700 border-amber-200',
  Closed:    'bg-green-50 text-green-700 border-green-200',
  Lost:      'bg-red-50 text-red-600 border-red-200',
}

const STATUS_DOTS = {
  New:       'bg-gray-400',
  Contacted: 'bg-blue-500',
  Qualified: 'bg-amber-500',
  Closed:    'bg-green-500',
  Lost:      'bg-red-500',
}

const SIZES = {
  xs: 'px-1.5 py-0.5 text-[10px] gap-1',
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1.5',
}

export default function Badge({ status, size = 'sm', showDot = true, className = '' }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600 border-gray-200'
  const dot   = STATUS_DOTS[status] || 'bg-gray-400'
  const sz    = SIZES[size] || SIZES.sm

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${style} ${sz} ${className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />}
      {status}
    </span>
  )
}
