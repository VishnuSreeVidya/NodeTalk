import { useState, useCallback } from 'react'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import CallHandler from './components/CallHandler'
import Auth from './components/Auth'

export default function App() {
  const { user, loading } = useAuth()
  const [selectedUser, setSelectedUser] = useState(null)
  const [callState, setCallState] = useState(null)

  const handleSelectUser = useCallback((u) => {
    setSelectedUser(u)
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
      <Sidebar
        selectedUser={selectedUser}
        onSelectUser={handleSelectUser}
        incomingCall={callState?.type === 'ringing' ? callState : null}
      />
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
