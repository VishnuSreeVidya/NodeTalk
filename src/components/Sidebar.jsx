import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import ThemeSelector from './ThemeSelector'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import { useClickOutside } from '../hooks/useClickOutside'

import CreateGroupModal from '../features/groups/CreateGroupModal'
import ProfileModal from './ProfileModal'
import SettingsModal from './SettingsModal'
import NotificationBell from './NotificationBell'

function Sidebar({ selectedUser, onSelectUser, onSelectGroup, selectedGroup, incomingCall }) {
  const { user, profile, signOut, updateOnlineStatus } = useAuth()
  const [users, setUsers] = useState([])
  const [groups, setGroups] = useState([])
  const [typingUsers, setTypingUsers] = useState({})
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('chats')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [unreadCounts] = useState({})
  const typingRef = useRef(null)
  const profileMenuRef = useClickOutside(() => setShowProfileMenu(false), showProfileMenu)

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id)
      .order('is_online', { ascending: false })
      .order('username')
    if (error) {
      console.error('Failed to fetch users:', error.message)
    } else if (data) {
      setUsers(data)
    }
  }, [user])

  const fetchGroups = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('group_members')
      .select('groups:group_id(*, group_members(count))')
      .eq('user_id', user.id)

    if (!error && data) {
      const groupList = data.map((gm) => gm.groups).filter(Boolean)
      setGroups(groupList)
    }
  }, [user])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers()
    fetchGroups()
    supabase.rpc('cleanup_stale_users').then(() => fetchUsers())

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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUsers()
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) return
    updateOnlineStatus(true)

    const heartbeat = setInterval(() => {
      updateOnlineStatus(true)
    }, 30000)

    const handleBeforeUnload = () => {
      const url = `${supabase.supabaseUrl}/rest/v1/profiles?id=eq.${user.id}`
      const body = JSON.stringify({ is_online: false })
      const key = supabase.supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY
      try {
        const xhr = new XMLHttpRequest()
        xhr.open('PATCH', url, false)
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.setRequestHeader('apikey', key)
        xhr.setRequestHeader('Authorization', `Bearer ${key}`)
        xhr.send(body)
      } catch {
        // Silently fail on unload
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(heartbeat)
      updateOnlineStatus(false)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [user, updateOnlineStatus])

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

  const filtered = useMemo(() =>
    users.filter((u) =>
      u.username?.toLowerCase().includes(search.toLowerCase())
    ), [users, search])

  const onlineCount = useMemo(() =>
    users.filter((u) => u.is_online).length, [users])

  return (
    <div
      className="w-full lg:w-80 h-full flex flex-col border-r border-white/30 relative backdrop-blur-xl"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      <CreateGroupModal
        open={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreated={(g) => { fetchGroups(); onSelectGroup?.(g) }}
        users={users}
      />
      <ProfileModal
        open={showProfile}
        onClose={() => setShowProfile(false)}
      />
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-md" style={{ background: 'var(--accent)' }}>
              N
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)] tracking-tight">NodeTalk</p>
              <p className="text-[10px] text-[var(--text-secondary)] font-medium">{onlineCount} online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ThemeSelector />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-10 text-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/20">
        {['chats', 'groups'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all relative ${
              activeTab === tab
                ? 'text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="sidebar-tab"
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                style={{ background: 'var(--accent)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {activeTab === 'chats' ? (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-3xl mb-3">🔍</p>
                <p className="text-[var(--text-secondary)] text-sm">No conversations found</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filtered.map((u, index) => {
                  const isSelected = selectedUser?.id === u.id
                  const isTyping = typingUsers[u.id]
                  const isCalling = incomingCall?.callerId === u.id
                  return (
                    <motion.button
                      key={u.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => onSelectUser(u)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all duration-200 text-left group ${
                        isSelected
                          ? 'shadow-sm'
                          : 'hover:bg-white/40'
                      } ${isCalling ? 'ring-2 ring-green-400/50' : ''}`}
                      style={isSelected ? { background: 'color-mix(in srgb, var(--accent) 12%, transparent)' } : undefined}
                    >
                      <Avatar
                        username={u.username}
                        size="md"
                        isOnline={u.is_online}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold truncate ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                            {u.username}
                          </span>
                          {unreadCounts[u.id] > 0 && !isSelected && (
                            <Badge count={unreadCounts[u.id]} size="sm" />
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] truncate">
                          {isCalling ? (
                            <span className="text-emerald-500 font-medium animate-pulse">Incoming call...</span>
                          ) : isTyping ? (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              style={{ color: 'var(--accent)' }}
                              className="font-medium"
                            >
                              typing...
                            </motion.span>
                          ) : (
                            u.status_message || 'Hey there!'
                          )}
                        </p>
                      </div>
                    </motion.button>
                  )
                })}
              </AnimatePresence>
            )}
          </>
        ) : (
          <div>
            <div className="px-2 py-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCreateGroup(true)}
                className="w-full glass rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:bg-white/40"
                style={{ color: 'var(--accent)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Group
              </motion.button>
            </div>
            {groups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-3">🏠</p>
                <p className="text-[var(--text-secondary)] text-sm">No groups yet</p>
                <p className="text-[var(--text-secondary)] text-xs mt-1">Create one to get started</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {groups.filter((g) => g.name?.toLowerCase().includes(search.toLowerCase())).map((g, index) => {
                  const isSelected = selectedGroup?.id === g.id
                  return (
                    <motion.button
                      key={g.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => onSelectGroup?.(g)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all duration-200 text-left ${
                        isSelected ? 'shadow-sm' : 'hover:bg-white/40'
                      }`}
                      style={isSelected ? { background: 'color-mix(in srgb, var(--accent) 12%, transparent)' } : undefined}
                    >
                      <Avatar username={g.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-semibold truncate block ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                          {g.name}
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)]">
                          {g.group_members?.[0]?.count || 0} members
                        </span>
                      </div>
                    </motion.button>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>

      {/* User profile footer */}
      <div className="p-3 border-t border-white/20 relative" ref={profileMenuRef}>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/40 transition-all"
        >
          <Avatar username={profile?.username} size="sm" isOnline={true} />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{profile?.username || 'User'}</p>
            <p className="text-[10px] text-[var(--text-secondary)] truncate">{profile?.status_message || 'Online'}</p>
          </div>
          <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.button>

        <AnimatePresence>
          {showProfileMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="absolute bottom-full left-3 right-3 mb-2 glass-strong rounded-2xl p-2 shadow-xl z-10"
            >
              <button
                onClick={() => { setShowProfile(true); setShowProfileMenu(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] hover:bg-white/10 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>
              <button
                onClick={() => { setShowSettings(true); setShowProfileMenu(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] hover:bg-white/10 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
              <div className="border-t border-white/10 my-1" />
              <button
                onClick={() => { signOut(); setShowProfileMenu(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default memo(Sidebar)