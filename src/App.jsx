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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white"
          style={{ background: 'var(--accent)' }}
        >
          N
        </div>
        <div
          className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
          style={{
            borderColor: 'color-mix(in srgb, var(--accent) 25%, transparent)',
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

  const handleBack = useCallback(() => {
    setSelectedUser(null)
    setSelectedGroup(null)
    setSidebarOpen(false)
  }, [])

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

  const hasActiveChat = !!(selectedUser || selectedGroup)

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="h-[100dvh] w-full flex app-container overflow-hidden relative">
        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="lg:hidden fixed inset-0 z-30"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen || !hasActiveChat ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:relative inset-y-0 left-0 z-40 w-full sm:w-80 lg:w-72 h-full transition-transform duration-300 ease-out flex-shrink-0`}
        >
          <Sidebar
            selectedUser={selectedUser}
            onSelectUser={handleSelectUser}
            selectedGroup={selectedGroup}
            onSelectGroup={handleSelectGroup}
            incomingCall={callState?.type === 'ringing' ? callState : null}
          />
        </div>

        {/* Main content */}
        <div className={`flex-1 min-w-0 h-full relative ${!hasActiveChat ? 'hidden lg:flex' : 'flex'}`}>
          <motion.div
            key={selectedGroup ? 'group' : selectedUser?.id || 'empty'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="h-full w-full flex flex-col"
          >
            {selectedGroup ? (
              <GroupChatWindow group={selectedGroup} onBack={handleBack} />
            ) : (
              <ChatWindow
                selectedUser={selectedUser}
                onStartCall={handleStartCall}
                onBack={handleBack}
              />
            )}
          </motion.div>
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
