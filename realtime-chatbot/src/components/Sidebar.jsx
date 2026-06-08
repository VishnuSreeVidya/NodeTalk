import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import ThemeSelector from './ThemeSelector'

export default function Sidebar({ selectedUser, onSelectUser, incomingCall }) {
  const { user, profile, signOut, updateOnlineStatus } = useAuth()
  const [users, setUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState({})
  const [search, setSearch] = useState('')
  const typingRef = useRef(null)

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id)
      .order('is_online', { ascending: false })
      .order('username')
    if (data) setUsers(data)
  }

  useEffect(() => {
    fetchUsers()

    const channel = supabase
      .channel('profiles-channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          setUsers((prev) =>
            prev.map((u) => (u.id === payload.new.id ? { ...u, ...payload.new } : u))
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => { if (user) fetchUsers() }, [user?.id])

  useEffect(() => {
    if (!user) return
    updateOnlineStatus(true)

    const handleBeforeUnload = () => {
      navigator.sendBeacon(
        `${supabase.supabaseUrl}/rest/v1/rpc/update_online_status?is_online=false`
      )
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      updateOnlineStatus(false)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    const channel = supabase.channel('typing-channel', {
      config: { broadcast: { self: false } },
    })

    channel.on('broadcast', { event: 'typing' }, (payload) => {
      const { senderId, senderName } = payload.payload
      if (senderId === user.id) return

      setTypingUsers((prev) => ({ ...prev, [senderId]: senderName }))
      clearTimeout(typingRef.current)
      typingRef.current = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = { ...prev }
          delete next[senderId]
          return next
        })
      }, 2500)
    })

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
      clearTimeout(typingRef.current)
    }
  }, [user])

  const filtered = users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div
      className="w-full lg:w-80 h-full flex flex-col border-r border-white/10 relative"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center text-lg font-bold text-white">
              {profile?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{profile?.username || 'User'}</p>
              <p className="text-xs text-white/40">{profile?.status_message || ''}</p>
            </div>
          </div>
          <ThemeSelector />
        </div>

        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-10 text-sm"
          />
        </div>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 && (
          <p className="text-white/30 text-center py-8 text-sm">No users found</p>
        )}
        {filtered.map((u) => {
          const isSelected = selectedUser?.id === u.id
          const isTyping = typingUsers[u.id]
          const isCalling = incomingCall?.callerId === u.id
          return (
            <button
              key={u.id}
              onClick={() => onSelectUser(u)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 text-left ${
                isSelected
                  ? 'bg-white/15 border border-white/20'
                  : 'hover:bg-white/5 border border-transparent'
              } ${isCalling ? 'ring-2 ring-green-400/50' : ''}`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-xl glass-strong flex items-center justify-center text-base font-bold">
                  {u.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <span className={`presence-dot absolute -bottom-0.5 -right-0.5 ${u.is_online ? 'online' : 'offline'}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white truncate">{u.username}</span>
                  <span className="text-[10px] text-white/30">{u.is_online ? 'online' : 'offline'}</span>
                </div>
                <p className="text-xs text-white/40 truncate">
                  {isCalling ? (
                    <span className="text-green-400 animate-pulse">Incoming call...</span>
                  ) : isTyping ? (
                    <span className="text-purple-400 animate-fade-in">typing...</span>
                  ) : (
                    u.status_message || 'Hey there!'
                  )}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={signOut}
          className="w-full glass text-sm py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  )
}
