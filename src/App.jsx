import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import { supabase } from './supabaseClient'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import CallHandler from './components/CallHandler'
import Auth from './components/Auth'
import { useIsMobile } from './hooks/useMediaQuery'

export default function App() {
  const { user, loading } = useAuth()
  const [selectedUser, setSelectedUser] = useState(null)
  const [callState, setCallState] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('selected-user-sync')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          setSelectedUser((prev) => {
            if (prev && prev.id === payload.new.id) {
              return { ...prev, ...payload.new }
            }
            return prev
          })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user])

  const handleSelectUser = useCallback((u) => {
    setSelectedUser(u)
    if (isMobile) setSidebarOpen(false)
  }, [isMobile])

  const handleStartCall = useCallback((type) => {
    setCallState({ type: 'calling', callType: type })
  }, [])

  const handleCallChange = useCallback((state) => {
    setCallState(state)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center app-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg" style={{ background: 'var(--accent)' }}>
            N
          </div>
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'color-mix(in srgb, var(--accent) 40%, transparent)', borderTopColor: 'transparent' }} />
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="h-screen w-full flex app-container overflow-hidden">
      {/* Mobile hamburger */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 glass !p-2.5 !rounded-xl"
        style={{ color: 'var(--accent)' }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </motion.button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-40 h-full transition-transform duration-300 ease-out`}
      >
        <Sidebar
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
          incomingCall={callState?.type === 'ringing' ? callState : null}
        />
      </motion.div>

      {/* Chat area */}
      <div className="flex-1 min-w-0">
        <ChatWindow
          selectedUser={selectedUser}
          onStartCall={handleStartCall}
        />
      </div>

      {/* Call overlay */}
      <CallHandler
        selectedUser={selectedUser}
        onCallChange={handleCallChange}
        callRequest={callState}
      />
    </div>
  )
}
