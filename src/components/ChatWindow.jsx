import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import EmptyState from '../ui/EmptyState'
import Skeleton from '../ui/Skeleton'
import { initEncryption, encryptMessage, decryptMessage } from '../utils/crypto'
import { shouldShowDateSeparator } from '../lib/utils'
import { MESSAGE_PAGE_SIZE } from '../lib/constants'
import { DateSeparator, SingleTypingIndicator } from './shared'
import MessageContextMenu from './shared/MessageContextMenu'
import ChatHeader from './shared/ChatHeader'
import {
  fetchDMMessages,
  sendDMMessage,
  editDMMessage,
  deleteDMMessage,
  markMessagesRead,
  markMessagesDelivered,
  togglePinMessage,
  fetchReactions as fetchReactionsApi,
} from '../services/messageService'
import { createNotification } from '../services/notificationService'

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
    await markMessagesRead(unreadIds)
  }, [selectedUser, user])

  const markAsDelivered = useCallback(async () => {
    if (!selectedUser || !user) return
    const undeliveredIds = messagesRef.current
      .filter((m) => m.sender_id === user.id && m.receiver_id === selectedUser.id && m.message_status === 'sent')
      .map((m) => m.id)

    if (undeliveredIds.length === 0) return
    await markMessagesDelivered(undeliveredIds)
  }, [selectedUser, user])

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
    const { data, error } = await fetchDMMessages(user.id, selectedUser.id, MESSAGE_PAGE_SIZE)

    if (error) {
      console.error('Failed to fetch messages:', error.message)
    } else if (data) {
      setMessages(data)
    }
    setLoading(false)
  }, [user, selectedUser])

  const loadReactions = useCallback(async () => {
    if (!selectedUser) return
    const messageIds = messagesRef.current.map((m) => m.id)
    if (messageIds.length === 0) return

    const { data } = await fetchReactionsApi(messageIds)
    if (data) setReactions(data)
  }, [selectedUser])

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
            createNotification({
              userId: user.id,
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
    loadReactions()
  }, [messages]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedUser) return

    const channel = supabase
      .channel(`reactions-${user.id}-${selectedUser.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reactions' },
        () => { loadReactions() }
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

      const { error } = await editDMMessage(editMessage.id, payload)
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

    const { error } = await sendDMMessage(payload)
    if (!error) {
      setText('')
      setReplyTo(null)
    } else {
      console.error('Failed to send message:', error.message)
    }
  }

  const handleDeleteMessage = async (msg, deleteForAll = false) => {
    if (deleteForAll && msg.sender_id === user.id) {
      await deleteDMMessage(msg.id, true)
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== msg.id))
    }
    setContextMenu(null)
  }

  const handlePinMessage = async (msg) => {
    const isPinned = !msg.is_pinned
    await togglePinMessage(msg.id, isPinned, user.id)
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
      const t = decryptedTexts[m.id] || m.message_text || ''
      return t.toLowerCase().includes(q)
    })
  }, [messages, searchQuery, decryptedTexts])

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center h-full app-container">
        <EmptyState
          variant="chat"
          title="Welcome to NodeTalk"
          description="Select a user from the sidebar to start chatting"
        />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full app-container relative">
      <ChatHeader
        user={selectedUser}
        isGroup={false}
        receiverTyping={receiverTyping}
        sharedKey={sharedKey}
        onSearchToggle={() => setShowSearch(!showSearch)}
        onStartAudioCall={() => onStartCall?.('audio')}
        onStartVideoCall={() => onStartCall?.('video')}
      />

      {/* Search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-b"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <div className="p-2.5 flex items-center gap-2" style={{ background: 'var(--surface-primary)' }}>
              <div className="relative flex-1">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search in conversation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="surface-input w-full pl-8"
                  autoFocus
                />
              </div>
              <button
                onClick={() => { setShowSearch(false); setSearchQuery('') }}
                className="surface-icon-btn"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1 relative"
        style={{ background: 'var(--surface-primary)' }}
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
                    <p className="text-xs italic py-1 px-4" style={{ color: 'var(--text-tertiary)' }}>This message was deleted</p>
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

        {receiverTyping && <SingleTypingIndicator />}

        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 16 }}
            transition={{ duration: 0.15 }}
            onClick={scrollToBottom}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 rounded-full p-2.5 transition-transform"
            style={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border-secondary)',
              color: 'var(--accent)',
              boxShadow: 'var(--shadow-popover)',
            }}
            title="Jump to latest"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Context menu */}
      <AnimatePresence>
        {contextMenu && (
          <MessageContextMenu
            contextMenu={contextMenu}
            user={user}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDeleteMessage}
            onPin={handlePinMessage}
            onClose={() => setContextMenu(null)}
          />
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
