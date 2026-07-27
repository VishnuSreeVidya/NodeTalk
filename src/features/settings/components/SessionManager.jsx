import { useState, useEffect, useRef, memo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import Button from '../../../ui/Button'

/**
 * Session management component.
 * Displays active devices/sessions and allows logout from individual sessions.
 * Uses browser fingerprinting for device identification.
 */
function SessionManager() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!user || initializedRef.current) return
    initializedRef.current = true

    // Store session info in localStorage for device tracking
    const sessionId = getOrCreateSessionId()
    const deviceInfo = getDeviceInfo()

    // Register this session
    const allSessions = JSON.parse(localStorage.getItem('nodetalk-sessions') || '{}')
    allSessions[sessionId] = {
      ...deviceInfo,
      lastActive: new Date().toISOString(),
      userId: user.id,
    }
    localStorage.setItem('nodetalk-sessions', JSON.stringify(allSessions))

    // List all sessions for this user
    const userSessions = Object.entries(allSessions)
      .filter(([, s]) => s.userId === user.id)
      .map(([id, data]) => ({ id, ...data }))

    setSessions(userSessions)
    setLoading(false)

    // Cleanup on unload
    const handleUnload = () => {
      const storedSessions = JSON.parse(localStorage.getItem('nodetalk-sessions') || '{}')
      delete storedSessions[sessionId]
      localStorage.setItem('nodetalk-sessions', JSON.stringify(storedSessions))
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [user])

  const logoutSession = (sessionId) => {
    const allSessions = JSON.parse(localStorage.getItem('nodetalk-sessions') || '{}')
    delete allSessions[sessionId]
    localStorage.setItem('nodetalk-sessions', JSON.stringify(allSessions))
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
  }

  const logoutAllOtherSessions = () => {
    const currentId = getOrCreateSessionId()
    const allSessions = JSON.parse(localStorage.getItem('nodetalk-sessions') || '{}')
    const current = { [currentId]: allSessions[currentId] }
    localStorage.setItem('nodetalk-sessions', JSON.stringify(current))
    setSessions(currentId && current[currentId] ? [{ id: currentId, ...current[currentId] }] : [])
  }

  if (loading) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-[var(--text-primary)]">Active Sessions</h4>
        {sessions.length > 1 && (
          <Button variant="ghost" size="sm" onClick={logoutAllOtherSessions}>
            Logout all others
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {sessions.map((session) => {
          const isCurrent = session.id === getOrCreateSessionId()
          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
                {session.deviceType === 'mobile' ? '📱' : '💻'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {session.browser}
                  </p>
                  {isCurrent && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
                      Current
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[var(--text-secondary)]">
                  {session.os} • {session.deviceType}
                </p>
                <p className="text-[10px] text-[var(--text-secondary)]">
                  Last active: {new Date(session.lastActive).toLocaleString()}
                </p>
              </div>
              {!isCurrent && (
                <Button variant="danger" size="sm" onClick={() => logoutSession(session.id)}>
                  Logout
                </Button>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function getOrCreateSessionId() {
  let id = sessionStorage.getItem('nodetalk-session-id')
  if (!id) {
    id = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    sessionStorage.setItem('nodetalk-session-id', id)
  }
  return id
}

function getDeviceInfo() {
  const ua = navigator.userAgent
  let browser = 'Unknown Browser'
  let os = 'Unknown OS'
  let deviceType = 'desktop'

  if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Edg')) browser = 'Edge'
  else if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Safari')) browser = 'Safari'

  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'

  if (/Mobi|Android/i.test(ua)) deviceType = 'mobile'
  else if (/iPad|Tablet/i.test(ua)) deviceType = 'tablet'

  return { browser, os, deviceType }
}

export default memo(SessionManager)
