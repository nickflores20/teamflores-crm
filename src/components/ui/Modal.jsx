import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

const SIZES = {
  sm:   'max-w-md',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-6xl',
}

export default function Modal({ isOpen, onClose, title, size = 'md', children, hideClose = false }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={[
              'relative z-10 w-full bg-white shadow-modal',
              'rounded-t-2xl sm:rounded-xl overflow-hidden flex flex-col',
              'max-h-[92vh]',
              SIZES[size] || SIZES.md,
            ].join(' ')}
          >
            {/* Header — navy bar like FUB */}
            {(title || !hideClose) && (
              <div className="flex items-center justify-between px-5 py-4 bg-navy-800 flex-shrink-0">
                {title && (
                  <h2 className="font-serif text-lg text-white font-semibold">{title}</h2>
                )}
                {!hideClose && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Close"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
