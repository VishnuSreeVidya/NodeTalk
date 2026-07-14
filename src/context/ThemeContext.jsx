import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const ThemeContext = createContext()

const THEMES = [
  { id: 'glass-dark', label: 'Glass Dark' },
  { id: 'amethyst', label: 'Vibrant Amethyst' },
  { id: 'cyberpunk', label: 'Retro Cyberpunk' },
]

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('chat-theme') || 'glass-dark'
  })

  const setTheme = async (newTheme) => {
    setThemeState(newTheme)
    localStorage.setItem('chat-theme', newTheme)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ current_theme: newTheme }).eq('id', user.id)
    }
  }

  useEffect(() => {
    document.documentElement.className = `theme-${theme}`
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
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
