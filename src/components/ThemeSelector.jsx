import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const THEME_PREVIEW = {
  'glass-dark': { icon: '🌑', border: 'border-purple-400/30' },
  'amethyst': { icon: '🔮', border: 'border-purple-400/30' },
  'cyberpunk': { icon: '💀', border: 'border-pink-400/40' },
  'custom': { icon: '🎨', border: 'border-emerald-400/40' },
}

const COLOR_FIELDS = [
  { key: 'bgFrom', label: 'BG Gradient Start' },
  { key: 'bgTo', label: 'BG Gradient End' },
  { key: 'accent', label: 'Accent' },
  { key: 'textPrimary', label: 'Text Primary' },
  { key: 'textSecondary', label: 'Text Secondary' },
]

export default function ThemeSelector() {
  const { theme, setTheme, themes, customColors, setCustomColors } = useTheme()
  const [open, setOpen] = useState(false)
  const [showCustom, setShowCustom] = useState(false)

  const current = THEME_PREVIEW[theme]

  const handleThemeSelect = (tId) => {
    setTheme(tId)
    if (tId === 'custom') {
      setShowCustom(true)
    } else {
      setShowCustom(false)
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); setShowCustom(false) }}
        className="glass text-sm px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-[var(--accent)]/10 transition-all"
      >
        <span>{current?.icon}</span>
        <span className="hidden sm:inline text-[var(--text-secondary)]">{themes.find(t => t.id === theme)?.label}</span>
        <svg className={`w-3 h-3 text-[var(--text-secondary)] transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 glass-strong rounded-2xl p-2 min-w-[220px] animate-fade-in">
            {!showCustom ? (
              themes.map((t) => {
                const prev = THEME_PREVIEW[t.id]
                return (
                  <button
                    key={t.id}
                    onClick={() => handleThemeSelect(t.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      theme === t.id
                        ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--accent)]/5 hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="text-xl">{prev?.icon}</span>
                    <span className="font-medium">{t.label}</span>
                    {theme === t.id && (
                      <svg className="w-4 h-4 ml-auto text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                )
              })
            ) : (
              <div className="px-3 py-2">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setShowCustom(false)}
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <span className="text-xs font-semibold text-[var(--text-primary)]">Custom Colors</span>
                </div>
                <div className="space-y-2.5">
                  {COLOR_FIELDS.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-[11px] text-[var(--text-secondary)]">{label}</span>
                      <label className="relative w-7 h-7 rounded-lg border border-white/20 overflow-hidden cursor-pointer shadow-sm hover:scale-110 transition-transform">
                        <input
                          type="color"
                          value={customColors[key]}
                          onChange={(e) => setCustomColors({ [key]: e.target.value })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-full h-full" style={{ background: customColors[key] }} />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
