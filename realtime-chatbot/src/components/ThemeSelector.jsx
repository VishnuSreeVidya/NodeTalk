import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'

const THEME_PREVIEW = {
  'glass-dark': { icon: '🌑', border: 'border-purple-400/30' },
  'amethyst': { icon: '🔮', border: 'border-purple-400/30' },
  'cyberpunk': { icon: '💀', border: 'border-pink-400/40' },
}

export default function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme()
  const [open, setOpen] = useState(false)

  const current = THEME_PREVIEW[theme]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="glass text-sm px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-white/15 transition-all"
      >
        <span>{current?.icon}</span>
        <span className="hidden sm:inline text-white/80">{themes.find(t => t.id === theme)?.label}</span>
        <svg className={`w-3 h-3 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 glass-strong rounded-2xl p-2 min-w-[200px] animate-fade-in">
            {themes.map((t) => {
              const prev = THEME_PREVIEW[t.id]
              return (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setOpen(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    theme === t.id
                      ? 'bg-white/15 text-white'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{prev?.icon}</span>
                  <span className="font-medium">{t.label}</span>
                  {theme === t.id && (
                    <svg className="w-4 h-4 ml-auto text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
