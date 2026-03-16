import { useEffect, useRef } from 'react'
import { REFRESH_INTERVAL_MS } from '../api/apiConfig.js'

/**
 * Runs `callback` on an interval.
 * Pauses when the page is hidden (tab in background).
 */
export function useAutoRefresh(callback, interval = REFRESH_INTERVAL_MS) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const tick = () => {
      if (!document.hidden) {
        callbackRef.current()
      }
    }

    const timer = setInterval(tick, interval)

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Refresh immediately when tab becomes visible again
        callbackRef.current()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [interval])
}
