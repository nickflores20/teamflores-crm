// Stage color definitions for all 8 mortgage CRM stages
export const STAGE_META = {
  'New':         { bg: '#EBF3FA', text: '#2E75B6', dot: '#2E75B6', border: '#BDD9F0' },
  'Contacted':   { bg: '#FDF0E8', text: '#C55A11', dot: '#C55A11', border: '#F5C8A0' },
  'Active':      { bg: '#E8F5EE', text: '#1E7145', dot: '#1E7145', border: '#A8D8BC' },
  'Qualified':   { bg: '#F0EBFB', text: '#5E35B1', dot: '#5E35B1', border: '#C8B3F0' },
  'In Progress': { bg: '#E8EFF6', text: '#1A3E61', dot: '#1A3E61', border: '#B0C4D8' },
  'Closed Won':  { bg: '#FBF5E8', text: '#8A6A2A', dot: '#C6A76F', border: '#E8D5A8' },
  'Cold':        { bg: '#F0F0F0', text: '#666666', dot: '#888888', border: '#CCCCCC' },
  'Dead':        { bg: '#FBEAEA', text: '#C00000', dot: '#C00000', border: '#F0B0B0' },
}

const SIZES = {
  xs: { fontSize: '10px', padding: '1px 6px', gap: '4px', dotSize: '5px' },
  sm: { fontSize: '11px', padding: '2px 8px', gap: '5px', dotSize: '6px' },
  md: { fontSize: '12px', padding: '4px 10px', gap: '6px', dotSize: '7px' },
}

export default function Badge({ status, size = 'sm', showDot = true, className = '' }) {
  const meta = STAGE_META[status] || { bg: '#F0F0F0', text: '#666666', dot: '#999999', border: '#CCCCCC' }
  const sz   = SIZES[size] || SIZES.sm

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${className}`}
      style={{
        backgroundColor: meta.bg,
        color: meta.text,
        borderColor: meta.border,
        fontSize: sz.fontSize,
        padding: sz.padding,
        gap: sz.gap,
      }}
    >
      {showDot && (
        <span
          className="rounded-full flex-shrink-0"
          style={{ width: sz.dotSize, height: sz.dotSize, backgroundColor: meta.dot }}
        />
      )}
      {status}
    </span>
  )
}
