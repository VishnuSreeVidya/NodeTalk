import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import EmptyState from '../ui/EmptyState'
import Skeleton from '../ui/Skeleton'
import Avatar from '../ui/Avatar'
import { initEncryption, encryptMessage, decryptMessage } from '../utils/crypto'
import { shouldShowDateSeparator, formatDateSeparator } from '../lib/utils'
import { MESSAGE_PAGE_SIZE } from '../lib/constants'
import { formatLastSeen } from '../lib/utils'

function DateSeparator({ date }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center my-4"
    >
      <div className="glass-strong rounded-full px-4 py-1.5">
        <span className="text-[11px] font-semibold text-[var(--text-secondary)]">{formatDateSeparator(date)}</span>
      </div>
    </motion.div>
  )
}

export default function ChatWindow({ selectedUser, onStartCall }) {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [receiverTyping, setReceiverTyping] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [reactions, setReactions] = useState([])
  const [replyTo, setReplyTo] = useState(null)
  const [editMessage, setEditMessage] = useState(null)
  const [sharedKey, setSharedKey] = useState(null)
  const [decryptedTexts, setDecryptedTexts] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)
  const bottomRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const isTypingRef = useRef(false)
  const inputRef = useRef(null)
  const messagesRef = useRef(messages)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const markReadTimerRef = useRef(null)
  const lastMarkReadRef = useRef(0)

  useEffect(() => {
    messagesRef.current = messages
  })

  const markAsRead = useCallback(async () => {
    if (!selectedUser || !user) return
    const now = Date.now()
    if (now - lastMarkReadRef.current < 3000) return
    lastMarkReadRef.current = now

    const unreadIds = messagesRef.current
      .filter((m) => m.sender_id === selectedUser.id && m.receiver_id === user.id && m.message_status !== 'read')
      .map((m) => m.id)

    if (unreadIds.length === 0) return

    await supabase
      .from('messages')
      .update({ message_status: 'read', read_at: new Date().toISOString() })
      .in('id', unreadIds)
      .eq('message_status', 'delivered')
  }, [selectedUser?.id, user?.id])

  const markAsDelivered = useCallback(async () => {
    if (!selectedUser || !user) return
    const undeliveredIds = messagesRef.current
      .filter((m) => m.sender_id === user.id && m.receiver_id === selectedUser.id && m.message_status === 'sent')
      .map((m) => m.id)

    if (undeliveredIds.length === 0) return

    await supabase
      .from('messages')
      .update({ message_status: 'delivered' })
      .in('id', undeliveredIds)
  }, [selectedUser?.id, user?.id])

  useEffect(() => {
    if (!selectedUser) return
    markAsRead()

    const handleVisibility = () => {
      if (!document.hidden) markAsRead()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [selectedUser?.id, messages]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMessages = useCallback(async () => {
    if (!selectedUser) return
    setLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
      .limit(MESSAGE_PAGE_SIZE)

    if (error) {
      console.error('Failed to fetch messages:', error.message)
    } else if (data) {
      setMessages(data)
    }
    setLoading(false)
  }, [user?.id, selectedUser?.id])

  const fetchReactions = useCallback(async () => {
    if (!selectedUser) return
    const messageIds = messagesRef.current.map((m) => m.id)
    if (messageIds.length === 0) return

    const { data } = await supabase
      .from('reactions')
      .select('*')
      .in('message_id', messageIds)

    if (data) setReactions(data)
  }, [selectedUser?.id])

  useEffect(() => {
    if (!selectedUser) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages()
    setDecryptedTexts({})
    setReplyTo(null)
    setEditMessage(null)
    setSearchQuery('')
    setShowSearch(false)
  }, [selectedUser?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedUser) return

    const channel = supabase
      .channel(`messages-${user.id}-${selectedUser.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `sender_id=eq.${selectedUser.id}` },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
          if (document.hidden) {
            supabase.from('notifications').insert({
              user_id: user.id,
              type: 'message',
              title: selectedUser.username,
              body: payload.new.message_text || '📷 Image',
            })
          }
          clearTimeout(markReadTimerRef.current)
          markReadTimerRef.current = setTimeout(() => {
            markAsDelivered()
            markAsRead()
          }, 500)
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `sender_id=eq.${user.id}` },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prev) =>
            prev.map((m) => m.id === payload.new.id ? { ...m, ...payload.new } : m)
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      clearTimeout(markReadTimerRef.current)
    }
  }, [selectedUser?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (messages.length === 0) return
    fetchReactions()
  }, [messages]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedUser) return

    const channel = supabase
      .channel(`reactions-${user.id}-${selectedUser.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reactions' },
        () => { fetchReactions() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedUser?.id, messages]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    setShowScrollBtn(false)
  }, [])

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return
    const { scrollTop, scrollHeight, clientHeight } = container
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100)
  }, [])

  useEffect(() => {
    if (!selectedUser) return

    const channel = supabase.channel(`typing-${user.id}-${selectedUser.id}`, {
      config: { broadcast: { self: false } },
    })

    channel.on('broadcast', { event: 'typing' }, (payload) => {
      if (payload.payload.senderId === selectedUser.id) {
        setReceiverTyping(true)
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => setReceiverTyping(false), 2500)
      }
    })

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
      clearTimeout(typingTimeoutRef.current)
    }
  }, [selectedUser?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedUser) return

    const setupEncryption = async () => {
      try {
        const key = await initEncryption(selectedUser.id)
        setSharedKey(key)
      } catch (err) {
        console.error('E2EE setup failed:', err)
      }
    }

    setupEncryption()
  }, [selectedUser?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!sharedKey || messages.length === 0) return

    const decryptAll = async () => {
      const newDecrypted = {}
      for (const msg of messages) {
        if (msg.encrypted && msg.encrypted_text && !decryptedTexts[msg.id]) {
          try {
            newDecrypted[msg.id] = await decryptMessage(msg.encrypted_text, sharedKey)
          } catch {
            newDecrypted[msg.id] = '[decryption failed]'
          }
        }
      }
      if (Object.keys(newDecrypted).length > 0) {
        setDecryptedTexts((prev) => ({ ...prev, ...newDecrypted }))
      }
    }

    decryptAll()
  }, [sharedKey, messages]) // eslint-disable-line react-hooks/exhaustive-deps

  const broadcastTyping = () => {
    if (isTypingRef.current) return
    isTypingRef.current = true

    const channel = supabase.channel(`typing-${user.id}-${selectedUser.id}`)
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { senderId: user.id, senderName: profile?.username },
        })
      }
    })

    setTimeout(() => {
      isTypingRef.current = false
      supabase.removeChannel(channel)
    }, 2000)
  }

  const sendMessage = async (msgText, imageUrl, fileMeta) => {
    const payload = {
      sender_id: user.id,
      receiver_id: selectedUser.id,
      message_status: 'sent',
    }

    if (editMessage) {
      if (sharedKey && !imageUrl) {
        try {
          payload.encrypted_text = await encryptMessage(msgText.trim(), sharedKey)
          payload.encrypted = true
          payload.message_text = '🔒 Encrypted message'
          payload.is_edited = true
        } catch {
          payload.message_text = msgText.trim()
          payload.is_edited = true
        }
      } else {
        payload.message_text = msgText.trim()
        payload.is_edited = true
      }

      const { error } = await supabase
        .from('messages')
        .update(payload)
        .eq('id', editMessage.id)

      if (!error) {
        setText('')
        setEditMessage(null)
      }
      return
    }

    if (replyTo) {
      payload.reply_to = replyTo.id
    }

    if (imageUrl) {
      payload.image_url = imageUrl
      payload.message_text = msgText || '📷 Image'
    } else if (fileMeta) {
      payload.file_url = fileMeta.file_url
      payload.file_name = fileMeta.file_name
      payload.file_type = fileMeta.file_type
      payload.file_size = fileMeta.file_size
      payload.message_text = msgText || fileMeta.file_name || '📎 File'
    } else {
      if (!msgText?.trim()) return
      if (sharedKey) {
        try {
          payload.encrypted_text = await encryptMessage(msgText.trim(), sharedKey)
          payload.encrypted = true
          payload.message_text = '🔒 Encrypted message'
        } catch {
          payload.message_text = msgText.trim()
        }
      } else {
        payload.message_text = msgText.trim()
      }
    }

    const { error } = await supabase.from('messages').insert(payload)

    if (!error) {
      setText('')
      setReplyTo(null)
    } else {
      console.error('Failed to send message:', error.message)
    }
  }

  const handleDeleteMessage = async (msg, deleteForAll = false) => {
    if (deleteForAll && msg.sender_id === user.id) {
      await supabase
        .from('messages')
        .update({ deleted_for_all: true, message_text: '🗑️ This message was deleted' })
        .eq('id', msg.id)
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== msg.id))
    }
    setContextMenu(null)
  }

  const handlePinMessage = async (msg) => {
    const isPinned = !msg.is_pinned
    await supabase
      .from('messages')
      .update({ is_pinned: isPinned })
      .eq('id', msg.id)

    if (isPinned) {
      await supabase
        .from('pinned_messages')
        .insert({ message_id: msg.id, pinned_by: user.id })
    } else {
      await supabase
        .from('pinned_messages')
        .delete()
        .eq('message_id', msg.id)
    }
    setContextMenu(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(text, null)
  }

  const handleEmojiSelect = (emoji) => {
    setText((prev) => prev + emoji)
    setShowEmoji(false)
    inputRef.current?.focus()
  }

  const handleImageUpload = (url) => {
    sendMessage('', url)
  }

  const handleFileUpload = (url, meta) => {
    sendMessage(meta?.name || 'File', null, { file_url: url, file_name: meta?.name, file_type: meta?.type, file_size: meta?.size })
  }

  const handleReply = (msg) => {
    setReplyTo(msg)
    setEditMessage(null)
    inputRef.current?.focus()
  }

  const handleEdit = (msg) => {
    setEditMessage(msg)
    setText(decryptedTexts[msg.id] || msg.message_text || '')
    setReplyTo(null)
    inputRef.current?.focus()
  }

  const handleContextMenu = (e, msg) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, message: msg })
  }

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages
    const q = searchQuery.toLowerCase()
    return messages.filter((m) => {
      const text = decryptedTexts[m.id] || m.message_text || ''
      return text.toLowerCase().includes(q)
    })
  }, [messages, searchQuery, decryptedTexts])

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center h-full app-container" style={{ background: 'var(--chat-bg)' }}>
        <EmptyState
          variant="chat"
          title="Welcome to NodeTalk"
          description="Select a user from the sidebar to start chatting"
        />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full app-container relative" style={{ background: 'var(--chat-bg)' }}>
      {/* Chat header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-b border-white/20 glass flex items-center gap-3 rounded-none backdrop-blur-xl"
      >
        <Avatar
          username={selectedUser.username}
          size="md"
          isOnline={selectedUser.is_online}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[var(--text-primary)] truncate">{selectedUser.username}</p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            {receiverTyping
              ? <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--accent)' }} className="font-medium">typing...</motion.span>
              : selectedUser.is_online ? 'Online' : formatLastSeen(selectedUser.last_seen)}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {sharedKey && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 glass !px-2 !py-1 !rounded-lg" title="End-to-end encrypted"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-[10px] font-bold" style={{ color: 'var(--accent)' }}>E2EE</span>
            </motion.div>
          )}

          <button
            onClick={() => { setShowSearch(!showSearch) }}
            className="glass !p-2 !rounded-xl transition-all hover:bg-white/20"
            style={{ color: 'var(--text-secondary)' }}
            title="Search messages"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <button
            onClick={() => onStartCall?.('audio')}
            className="glass !p-2 !rounded-xl transition-all hover:bg-white/20"
            style={{ color: 'var(--text-secondary)' }}
            title="Voice call"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button
            onClick={() => onStartCall?.('video')}
            className="glass !p-2 !rounded-xl transition-all hover:bg-white/20"
            style={{ color: 'var(--text-secondary)' }}
            title="Video call"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/20"
          >
            <div className="p-3 flex items-center gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search in conversation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input w-full pl-10 text-sm"
                  autoFocus
                />
              </div>
              <button
                onClick={() => { setShowSearch(false); setSearchQuery('') }}
                className="glass !p-2 !rounded-xl"
              >
                <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-1 relative"
      >
        {loading ? (
          <Skeleton pattern="message" className="py-4" />
        ) : filteredMessages.length === 0 ? (
          <EmptyState
            variant={searchQuery ? 'search' : 'chat'}
            title={searchQuery ? 'No messages found' : 'No messages yet'}
            description={searchQuery ? 'Try a different search' : 'Say hello!'}
          />
        ) : (
          <AnimatePresence initial={false}>
            {filteredMessages.map((msg, index) => {
              const showDate = shouldShowDateSeparator(
                msg.created_at,
                filteredMessages[index - 1]?.created_at
              )

              if (msg.deleted_for_all) {
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <p className="text-xs text-[var(--text-secondary)] italic py-1 px-4">🗑️ This message was deleted</p>
                  </motion.div>
                )
              }

              return (
                <div key={msg.id}>
                  {showDate && <DateSeparator date={msg.created_at} />}
                  <MessageBubble
                    msg={msg}
                    isOwn={msg.sender_id === user.id}
                    reactions={reactions.filter((r) => r.message_id === msg.id)}
                    allMessages={filteredMessages}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={handleDeleteMessage}
                    onPin={handlePinMessage}
                    onContextMenu={handleContextMenu}
                    decryptedText={decryptedTexts[msg.id]}
                  />
                </div>
              )
            })}
          </AnimatePresence>
        )}

        {receiverTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="glass-card px-4 py-3 flex items-center gap-1.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 glass-strong rounded-full p-3 shadow-lg z-10 hover:scale-110 transition-transform"
            style={{ color: 'var(--accent)' }}
            title="Jump to latest"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Context menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div className="fixed inset-0 z-50" onClick={() => setContextMenu(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed z-[60] glass-strong rounded-2xl p-2 shadow-xl min-w-[180px]"
              style={{ left: Math.min(contextMenu.x, window.innerWidth - 200), top: Math.min(contextMenu.y, window.innerHeight - 250) }}
            >
              <button
                onClick={() => { navigator.clipboard.writeText(contextMenu.message.message_text || ''); setContextMenu(null) }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--text-primary)] hover:bg-white/10 transition-colors"
              >
                📋 Copy
              </button>
              <button
                onClick={() => { handleReply(contextMenu.message); setContextMenu(null) }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--text-primary)] hover:bg-white/10 transition-colors"
              >
                ↩️ Reply
              </button>
              {contextMenu.message.sender_id === user.id && (
                <>
                  <button
                    onClick={() => { handleEdit(contextMenu.message); setContextMenu(null) }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--text-primary)] hover:bg-white/10 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(contextMenu.message, false)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--text-primary)] hover:bg-white/10 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(contextMenu.message, true)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    🗑️ Delete for everyone
                  </button>
                </>
              )}
              <button
                onClick={() => handlePinMessage(contextMenu.message)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--text-primary)] hover:bg-white/10 transition-colors"
              >
                📌 {contextMenu.message.is_pinned ? 'Unpin' : 'Pin'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Input */}
      <MessageInput
        ref={inputRef}
        text={text}
        setText={setText}
        showEmoji={showEmoji}
        setShowEmoji={setShowEmoji}
        onEmojiSelect={handleEmojiSelect}
        onFileUpload={handleFileUpload}
        onImageUpload={handleImageUpload}
        onSubmit={handleSubmit}
        selectedUser={selectedUser}
        onTyping={broadcastTyping}
        replyTo={replyTo}
        editMessage={editMessage}
        onCancelReply={() => setReplyTo(null)}
        onCancelEdit={() => { setEditMessage(null); setText('') }}
      />
    </div>
  )
}
