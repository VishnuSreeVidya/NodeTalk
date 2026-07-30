import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import ThemeSelector from './ThemeSelector'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'

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
      className="w-full lg:w-72 h-full flex flex-col border-r"
      style={{
        background: 'var(--surface-primary)',
        borderColor: 'var(--border-primary)',
      }}
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
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ background: 'var(--accent)' }}>
              N
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>NodeTalk</p>
              <p className="text-2xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{onlineCount} online</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <ThemeSelector />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="surface-input w-full pl-8 text-xs"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-3 gap-1 mb-1">
        {['chats', 'groups'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 text-xs font-medium rounded-[6px] transition-all relative"
            style={{
              color: activeTab === tab ? 'var(--accent)' : 'var(--text-tertiary)',
              background: activeTab === tab ? 'var(--accent-soft)' : 'transparent',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto px-1.5 space-y-0.5">
        {activeTab === 'chats' ? (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-10">
                <svg className="w-8 h-8 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-tertiary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No conversations found</p>
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
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ delay: index * 0.015 }}
                      onClick={() => onSelectUser(u)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg transition-all duration-150 text-left group"
                      style={{
                        background: isSelected ? 'var(--accent-soft)' : 'transparent',
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--surface-hover)' }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                    >
                      <Avatar
                        username={u.username}
                        size="sm"
                        isOnline={u.is_online}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate" style={{ color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                            {u.username}
                          </span>
                          {unreadCounts[u.id] > 0 && !isSelected && (
                            <Badge count={unreadCounts[u.id]} size="sm" />
                          )}
                        </div>
                        <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                          {isCalling ? (
                            <span className="font-medium" style={{ color: 'var(--success)' }}>Incoming call...</span>
                          ) : isTyping ? (
                            <span className="font-medium" style={{ color: 'var(--accent)' }}>typing...</span>
                          ) : (
                            u.status_message || 'Available'
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
            <div className="px-1 py-1.5">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCreateGroup(true)}
                className="w-full rounded-lg py-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-all border border-dashed"
                style={{
                  color: 'var(--accent)',
                  borderColor: 'var(--accent-soft)',
                  background: 'var(--accent-soft)',
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Group
              </motion.button>
            </div>
            {groups.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-8 h-8 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-tertiary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No groups yet</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {groups.filter((g) => g.name?.toLowerCase().includes(search.toLowerCase())).map((g, index) => {
                  const isSelected = selectedGroup?.id === g.id
                  return (
                    <motion.button
                      key={g.id}
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.015 }}
                      onClick={() => onSelectGroup?.(g)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg transition-all duration-150 text-left"
                      style={{
                        background: isSelected ? 'var(--accent-soft)' : 'transparent',
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--surface-hover)' }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                    >
                      <Avatar username={g.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block" style={{ color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                          {g.name}
                        </span>
                        <span className="text-2xs" style={{ color: 'var(--text-tertiary)' }}>
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
      <div className="p-2 border-t relative" style={{ borderColor: 'var(--border-primary)' }}>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="w-full flex items-center gap-2.5 p-2 rounded-lg transition-all"
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Avatar username={profile?.username} size="sm" isOnline={true} />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{profile?.username || 'User'}</p>
            <p className="text-2xs truncate" style={{ color: 'var(--text-tertiary)' }}>{profile?.status_message || 'Online'}</p>
          </div>
          <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.button>

        <AnimatePresence>
          {showProfileMenu && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              className="absolute bottom-full left-2 right-2 mb-1.5 py-1 z-10"
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-popover)',
              }}
            >
              <button
                onClick={() => { setShowProfile(true); setShowProfileMenu(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <svg className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>
              <button
                onClick={() => { setShowSettings(true); setShowProfileMenu(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <svg className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
              <div className="my-1" style={{ height: 1, background: 'var(--border-primary)' }} />
              <button
                onClick={() => { signOut(); setShowProfileMenu(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                style={{ color: 'var(--danger)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'color-mix(in srgb, var(--danger) 8%, transparent)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <svg className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
