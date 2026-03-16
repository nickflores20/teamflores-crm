function nameToColor(name) {
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500',
    'bg-teal-500', 'bg-indigo-500', 'bg-pink-500', 'bg-cyan-500',
  ]
  let hash = 0
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const SIZES = {
  xs:  'w-6 h-6 text-[10px]',
  sm:  'w-8 h-8 text-xs',
  md:  'w-9 h-9 text-sm',
  lg:  'w-11 h-11 text-base',
  xl:  'w-14 h-14 text-lg',
  '2xl': 'w-20 h-20 text-2xl',
}

export default function Avatar({ name = '?', size = 'md', ring = false, className = '' }) {
  const bg       = nameToColor(name)
  const initials = getInitials(name || '?')
  const sz       = SIZES[size] || SIZES.md

  return (
    <div
      className={[
        'rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 select-none',
        bg, sz,
        ring ? 'ring-2 ring-gold ring-offset-2 ring-offset-white' : '',
        className,
      ].filter(Boolean).join(' ')}
      aria-label={name}
    >
      {initials}
    </div>
  )
}
