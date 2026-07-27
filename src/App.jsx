import { useState, useCallback, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import { useIsMobile } from './hooks/useMediaQuery'
import { useRealtimeSubscription } from './hooks/useRealtimeSubscription'

const Sidebar = lazy(() => import('./components/Sidebar'))
const ChatWindow = lazy(() => import('./components/ChatWindow'))
const CallHandler = lazy(() => import('./components/CallHandler'))
const Auth = lazy(() => import('./components/Auth'))
const GroupChatWindow = lazy(() => import('./features/groups/GroupChatWindow'))

function LoadingSpinner() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center app-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
          style={{ background: 'var(--accent)' }}
        >
          N
        </div>
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{
            borderColor: 'color-mix(in srgb, var(--accent) 40%, transparent)',
            borderTopColor: 'transparent',
          }}
        />
      </motion.div>
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [callState, setCallState] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()

  useRealtimeSubscription({
    table: 'profiles',
    event: 'UPDATE',
    enabled: !!user,
    onUpdate: useCallback((payload) => {
      setSelectedUser((prev) => {
        if (prev && prev.id === payload.new.id) {
          return { ...prev, ...payload.new }
        }
        return prev
      })
    }, []),
  })

  const handleSelectUser = useCallback((u) => {
    setSelectedUser(u)
    setSelectedGroup(null)
    if (isMobile) setSidebarOpen(false)
  }, [isMobile])

  const handleSelectGroup = useCallback((g) => {
    setSelectedGroup(g)
    setSelectedUser(null)
    if (isMobile) setSidebarOpen(false)
  }, [isMobile])

  const handleStartCall = useCallback((type) => {
    setCallState({ type: 'calling', callType: type })
  }, [])

  const handleCallChange = useCallback((state) => {
    setCallState(state)
  }, [])

  if (loading) return <LoadingSpinner />

  if (!user) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Auth />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="h-screen w-full flex app-container overflow-hidden">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 glass !p-2.5 !rounded-xl"
          style={{ color: 'var(--accent)' }}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          aria-expanded={sidebarOpen}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </motion.button>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        <motion.div
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-40 h-full transition-transform duration-300 ease-out`}
        >
          <Sidebar
            selectedUser={selectedUser}
            onSelectUser={handleSelectUser}
            selectedGroup={selectedGroup}
            onSelectGroup={handleSelectGroup}
            incomingCall={callState?.type === 'ringing' ? callState : null}
          />
        </motion.div>

        <div className="flex-1 min-w-0">
          {selectedGroup ? (
            <GroupChatWindow group={selectedGroup} />
          ) : (
            <ChatWindow
              selectedUser={selectedUser}
              onStartCall={handleStartCall}
            />
          )}
        </div>

        <CallHandler
          selectedUser={selectedUser}
          onCallChange={handleCallChange}
          callRequest={callState}
        />
      </div>
    </Suspense>
  )
}
