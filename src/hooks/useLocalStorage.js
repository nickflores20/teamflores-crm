import { useState, useCallback } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (valueToStore === undefined) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (err) {
      console.error('[useLocalStorage] set error:', err)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}
