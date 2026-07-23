import { useState, useCallback, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { supabase } from './supabaseClient'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import CallHandler from './components/CallHandler'
import Auth from './components/Auth'

export default function App() {
  const { user, loading } = useAuth()
  const [selectedUser, setSelectedUser] = useState(null)
  const [callState, setCallState] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    setSidebarOpen(false)
  }, [])

  const handleStartCall = useCallback((type) => {
    setCallState({ type: 'calling', callType: type })
  }, [])

  const handleCallChange = useCallback((state) => {
    setCallState(state)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center app-container">
        <div className="w-10 h-10 border-2 border-purple-400/50 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="h-screen w-full flex app-container overflow-hidden">
      {/* Mobile hamburger */}
      <button
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
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-40 h-full transition-transform duration-300`}>
        <Sidebar
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
          incomingCall={callState?.type === 'ringing' ? callState : null}
        />
      </div>
      <ChatWindow
        selectedUser={selectedUser}
        onStartCall={handleStartCall}
      />
      <CallHandler
        selectedUser={selectedUser}
        onCallChange={handleCallChange}
        callRequest={callState}
      />
    </div>
  )
}
