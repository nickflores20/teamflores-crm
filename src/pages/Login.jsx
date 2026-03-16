import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 300))
    const success = login(password, remember)
    setLoading(false)
    if (success) {
      navigate('/inbox', { replace: true })
    } else {
      setError('Incorrect password. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-800/50 rounded-full blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-semibold text-gold tracking-tight mb-2">
            Team Flores
          </h1>
          <p className="text-sand/60 text-sm font-sans">CRM Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-navy-800 border border-gold/20 rounded-2xl p-8 shadow-floating">
          <h2 className="font-sans text-base font-semibold text-sand mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-sand/60 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={[
                    'w-full bg-navy-900 border rounded-xl px-4 py-3 text-sand placeholder-sand/25 pr-12',
                    'focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50',
                    'transition-colors duration-150',
                    error ? 'border-red-500/70' : 'border-white/10 hover:border-white/20',
                  ].join(' ')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sand/30 hover:text-sand/60 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 flex items-center gap-1 mt-0.5"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                  {error}
                </motion.p>
              )}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <span className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="sr-only"
                />
                <span className={[
                  'flex items-center justify-center w-4 h-4 rounded border transition-all duration-150',
                  remember ? 'bg-gold border-gold' : 'bg-navy-900 border-white/20 group-hover:border-gold/50',
                ].join(' ')}>
                  {remember && (
                    <svg className="w-2.5 h-2.5 text-navy-900" fill="none" viewBox="0 0 12 10">
                      <path d="M1 5l3.5 4L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              </span>
              <span className="text-sm text-sand/60 group-hover:text-sand/80 transition-colors">
                Remember me
              </span>
            </label>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || !password}
              whileTap={loading || !password ? {} : { scale: 0.98 }}
              transition={{ duration: 0.1 }}
              className={[
                'w-full py-3 rounded-xl font-semibold text-navy-900 transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800',
                loading || !password
                  ? 'bg-gold/50 cursor-not-allowed'
                  : 'bg-gold hover:bg-gold-light active:bg-gold-dark cursor-pointer',
              ].join(' ')}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </motion.button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-sand/25 mt-6">
          Nick Flores · NMLS #422150 · Sunnyhill Financial
        </p>
      </motion.div>
    </div>
  )
}
