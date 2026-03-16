import { createContext, useContext, useState, useCallback } from 'react'

const CRM_PASSWORD = 'TeamFlores2026'
const STORAGE_KEY = 'tf_auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      return saved?.token === CRM_PASSWORD
    } catch {
      return false
    }
  })

  const login = useCallback((password, remember = false) => {
    if (password === CRM_PASSWORD) {
      setIsAuthenticated(true)
      if (remember) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: CRM_PASSWORD, ts: Date.now() }))
      } else {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token: CRM_PASSWORD, ts: Date.now() }))
      }
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
