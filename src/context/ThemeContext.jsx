import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'

const ThemeContext = createContext()

const THEMES = [
  { id: 'glass-dark', label: 'Glass Dark' },
  { id: 'amethyst', label: 'Vibrant Amethyst' },
  { id: 'cyberpunk', label: 'Retro Cyberpunk' },
  { id: 'custom', label: 'Custom Theme' },
]

const DEFAULT_CUSTOM_COLORS = {
  bgFrom: '#E0F2FE',
  bgTo: '#BAE6FD',
  accent: '#0EA5E9',
  textPrimary: '#0369A1',
  textSecondary: '#0284C7',
  sidebarBg: 'rgba(255, 255, 255, 0.7)',
  chatBg: 'rgba(255, 255, 255, 0.4)',
}

function loadCustomColors() {
  try {
    const raw = localStorage.getItem('chat-custom-colors')
    return raw ? { ...DEFAULT_CUSTOM_COLORS, ...JSON.parse(raw) } : { ...DEFAULT_CUSTOM_COLORS }
  } catch {
    return { ...DEFAULT_CUSTOM_COLORS }
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('chat-theme') || 'glass-dark'
  })

  const [customColors, setCustomColorsState] = useState(loadCustomColors)

  const setTheme = async (newTheme) => {
    setThemeState(newTheme)
    localStorage.setItem('chat-theme', newTheme)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ current_theme: newTheme }).eq('id', user.id)
    }
  }

  const setCustomColors = useCallback((updater) => {
    setCustomColorsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      localStorage.setItem('chat-custom-colors', JSON.stringify(next))
      return next
    })
  }, [])

  useEffect(() => {
    document.documentElement.className = `theme-${theme}`
    if (theme === 'custom') {
      const root = document.documentElement.style
      root.setProperty('--bg-gradient-from', customColors.bgFrom)
      root.setProperty('--bg-gradient-to', customColors.bgTo)
      root.setProperty('--accent', customColors.accent)
      root.setProperty('--accent-glow', customColors.accent + '40')
      root.setProperty('--text-primary', customColors.textPrimary)
      root.setProperty('--text-secondary', customColors.textSecondary)
      root.setProperty('--sidebar-bg', customColors.sidebarBg)
      root.setProperty('--chat-bg', customColors.chatBg)
      root.setProperty('--bubble-own', `linear-gradient(135deg, ${customColors.accent}, ${customColors.accent}cc)`)
      root.setProperty('--bubble-other', 'rgba(255, 255, 255, 0.85)')
      root.setProperty('--bubble-own-text', '#ffffff')
      root.setProperty('--bubble-other-text', customColors.textPrimary)
    } else {
      const root = document.documentElement.style
      ;['--bg-gradient-from', '--bg-gradient-to', '--accent', '--accent-glow',
        '--text-primary', '--text-secondary', '--sidebar-bg', '--chat-bg',
        '--bubble-own', '--bubble-other', '--bubble-own-text', '--bubble-other-text'
      ].forEach((v) => root.removeProperty(v))
    }
  }, [theme, customColors])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES, customColors, setCustomColors }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
