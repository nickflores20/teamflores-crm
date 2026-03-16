export function Skeleton({ width = '100%', height = '1rem', className = '' }) {
  return (
    <div
      className={`shimmer rounded-md bg-surface-tertiary ${className}`}
      style={{ width, height }}
    />
  )
}

export function SkeletonTable({ rows = 8, cols = 6 }) {
  return (
    <div className="w-full bg-white">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 border-b border-surface-border"
        >
          <Skeleton width="1.25rem" height="1.25rem" className="rounded flex-shrink-0" />
          <Skeleton width="2rem"   height="2rem"    className="rounded-full flex-shrink-0" />
          {Array.from({ length: cols - 2 }).map((_, j) => (
            <Skeleton key={j} width={`${50 + (j * 15) % 40}%`} height="0.8rem" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
