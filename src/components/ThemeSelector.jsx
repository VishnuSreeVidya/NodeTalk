import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const THEME_PREVIEW = {
  midnight: { primary: '#1a1d23', accent: '#4f8ef7', text: '#e8eaed' },
  graphite: { primary: '#1e1e1e', accent: '#7c7c7c', text: '#e0e0e0' },
  ocean: { primary: '#0f1923', accent: '#48c8ff', text: '#e3edf7' },
  forest: { primary: '#161e14', accent: '#4cce8a', text: '#ddeee0' },
  'light-pro': { primary: '#ffffff', accent: '#3370ff', text: '#1d1d1f' },
  amoled: { primary: '#000000', accent: '#666666', text: '#e0e0e0' },
}

export default function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="surface-icon-btn rounded-lg"
        title="Change theme"
        aria-label="Change theme"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 min-w-[240px]"
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-popover)',
              }}
            >
              <div className="px-3 py-2.5 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>THEME</p>
              </div>
              <div className="p-1.5 space-y-0.5">
                {themes.map((t) => {
                  const prev = THEME_PREVIEW[t.id]
                  const isActive = theme === t.id
                  return (
                    <motion.button
                      key={t.id}
                      layout
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setTheme(t.id); setOpen(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                      style={{
                        background: isActive ? 'var(--accent-soft)' : 'transparent',
                        color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-md flex-shrink-0 flex items-center justify-center text-[10px] font-bold border"
                        style={{
                          background: prev.primary,
                          color: prev.text,
                          borderColor: 'var(--border-secondary)',
                        }}
                      >
                        <span style={{ color: prev.accent }}>◐</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{t.label}</p>
                        <p className="text-[11px] opacity-60 leading-tight mt-0.5">{t.desc}</p>
                      </div>
                      {isActive && (
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
