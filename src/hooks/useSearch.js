import { useMemo } from 'react'
import { useLeadsContext, getFullName } from '../context/LeadsContext.jsx'
import { useDebounce } from './useDebounce.js'

export function useSearch(query) {
  const { leads } = useLeadsContext()
  const debouncedQuery = useDebounce(query, 200)

  const results = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) return []
    const q = debouncedQuery.toLowerCase().trim()
    return leads
      .filter(l =>
        getFullName(l).toLowerCase().includes(q) ||
        (l['Email'] || '').toLowerCase().includes(q) ||
        (l['Phone'] || '').includes(q) ||
        (l['Zip Code'] || '').includes(q)
      )
      .slice(0, 8)
  }, [leads, debouncedQuery])

  return results
}
