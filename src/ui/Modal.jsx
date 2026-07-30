import { memo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose?.()
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350, mass: 0.8 }}
            className={`relative w-full ${maxWidth}`}
            style={{
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border-secondary)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-modal)',
            }}
          >
            {title && (
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {title}
                </h2>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="surface-icon-btn rounded-lg"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            )}
            <div className={title ? 'px-5 pb-5' : 'p-5'}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default memo(Modal)
