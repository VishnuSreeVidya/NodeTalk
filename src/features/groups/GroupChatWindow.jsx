import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabaseClient'
import MessageBubble from '../../components/MessageBubble'
import MessageInput from '../../components/MessageInput'
import EmptyState from '../../ui/EmptyState'
import Skeleton from '../../ui/Skeleton'
import Avatar from '../../ui/Avatar'
import { parseMarkdown, formatMessageTime, shouldShowDateSeparator, formatDateSeparator } from '../../lib/utils'
import { MESSAGE_PAGE_SIZE, TYPING_TIMEOUT } from '../../lib/constants'

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

export default function GroupChatWindow({ group, onBack }) {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [reactions, setReactions] = useState([])
  const [replyTo, setReplyTo] = useState(null)
  const [editMessage, setEditMessage] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const [showInfo, setShowInfo] = useState(false)
  const [members, setMembers] = useState([])
  const [typingUsers, setTypingUsers] = useState({})
  const bottomRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const inputRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const isTypingRef = useRef(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const fetchMessages = useCallback(async () => {
    if (!group) return
    setLoading(true)
    const { data, error } = await supabase
      .from('group_messages')
      .select('*')
      .eq('group_id', group.id)
      .order('created_at', { ascending: true })
      .limit(MESSAGE_PAGE_SIZE)

    if (!error && data) setMessages(data)
    setLoading(false)
  }, [group?.id])

  const fetchMembers = useCallback(async () => {
    if (!group) return
    const { data } = await supabase
      .from('group_members')
      .select('*, profiles:user_id(id, username, avatar_url, is_online)')
      .eq('group_id', group.id)

    if (data) setMembers(data)
  }, [group?.id])

  useEffect(() => {
    fetchMessages()
    fetchMembers()
    setReplyTo(null)
    setEditMessage(null)
  }, [group?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!group) return

    const channel = supabase
      .channel(`group-messages-${group.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${group.id}` },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'group_messages' },
        (payload) => {
          setMessages((prev) =>
            prev.map((m) => m.id === payload.new.id ? { ...m, ...payload.new } : m)
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [group?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!group) return

    const channel = supabase.channel(`group-typing-${group.id}`, {
      config: { broadcast: { self: false } },
    })

    channel.on('broadcast', { event: 'typing' }, (payload) => {
      const { senderId, senderName } = payload.payload
      if (senderId === user.id) return

      setTypingUsers((prev) => ({ ...prev, [senderId]: senderName }))
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = { ...prev }
          delete next[senderId]
          return next
        })
      }, TYPING_TIMEOUT)
    })

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
      clearTimeout(typingTimeoutRef.current)
    }
  }, [group?.id, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const broadcastTyping = useCallback(() => {
    if (isTypingRef.current) return
    isTypingRef.current = true

    const channel = supabase.channel(`group-typing-${group.id}`)
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
  }, [group?.id, user?.id, profile?.username])

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

  const sendMessage = async (msgText, imageUrl, fileMeta) => {
    const payload = {
      group_id: group.id,
      sender_id: user.id,
    }

    if (editMessage) {
      payload.message_text = msgText.trim()
      payload.is_edited = true
      await supabase.from('group_messages').update(payload).eq('id', editMessage.id)
      setText('')
      setEditMessage(null)
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
      payload.message_text = msgText.trim()
    }

    const { error } = await supabase.from('group_messages').insert(payload)
    if (!error) {
      setText('')
      setReplyTo(null)
    }
  }

  const handleDeleteMessage = async (msg, deleteForAll = false) => {
    if (deleteForAll && msg.sender_id === user.id) {
      await supabase
        .from('group_messages')
        .update({ deleted_for_all: true, message_text: '🗑️ This message was deleted' })
        .eq('id', msg.id)
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== msg.id))
    }
    setContextMenu(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(text, null)
  }

  const handleReply = (msg) => {
    setReplyTo(msg)
    setEditMessage(null)
    inputRef.current?.focus()
  }

  const handleEdit = (msg) => {
    setEditMessage(msg)
    setText(msg.message_text || '')
    setReplyTo(null)
    inputRef.current?.focus()
  }

  const handleContextMenu = (e, msg) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, message: msg })
  }

  if (!group) {
    return (
      <div className="flex-1 flex items-center justify-center h-full app-container" style={{ background: 'var(--chat-bg)' }}>
        <EmptyState variant="groups" title="Select a group" description="Choose a group from the sidebar" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full app-container relative" style={{ background: 'var(--chat-bg)' }}>
      {/* Group header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-b border-white/20 glass flex items-center gap-3 rounded-none backdrop-blur-xl"
      >
        <Avatar username={group.name} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[var(--text-primary)] truncate">{group.name}</p>
          <p className="text-[11px] text-[var(--text-secondary)]">{members.length} members</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="glass !p-2 !rounded-xl transition-all hover:bg-white/20"
            style={{ color: 'var(--text-secondary)' }}
            title="Group info"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-1 relative"
      >
        {loading ? (
          <Skeleton pattern="message" className="py-4" />
        ) : messages.length === 0 ? (
          <EmptyState variant="chat" title="No messages yet" description="Send the first message!" />
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const showDate = shouldShowDateSeparator(
                msg.created_at,
                messages[index - 1]?.created_at
              )

              if (msg.deleted_for_all) {
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
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
                    allMessages={messages}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={handleDeleteMessage}
                    onPin={async (m) => { await supabase.from('group_messages').update({ is_pinned: !m.is_pinned }).eq('id', m.id); setContextMenu(null) }}
                    onContextMenu={handleContextMenu}
                  />
                </div>
              )
            })}
          </AnimatePresence>
        )}

        {Object.keys(typingUsers).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="glass-card px-4 py-3 flex items-center gap-2">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="text-[11px] text-[var(--text-secondary)] ml-1">
                {Object.values(typingUsers).join(', ')} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing...
              </span>
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
              style={{ left: Math.min(contextMenu.x, window.innerWidth - 200), top: Math.min(contextMenu.y, window.innerHeight - 200) }}
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
                    onClick={() => handleDeleteMessage(contextMenu.message, true)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Input */}
      <MessageInput
        ref={inputRef}
        text={text}
        setText={setText}
        showEmoji={false}
        setShowEmoji={() => {}}
        onEmojiSelect={(e) => setText((prev) => prev + e)}
        onFileUpload={(url, meta) => sendMessage(meta?.name || 'File', null, { file_url: url, file_name: meta?.name, file_type: meta?.type, file_size: meta?.size })}
        onImageUpload={(url) => sendMessage('', url)}
        onSubmit={handleSubmit}
        selectedUser={group}
        onTyping={broadcastTyping}
        replyTo={replyTo}
        editMessage={editMessage}
        onCancelReply={() => setReplyTo(null)}
        onCancelEdit={() => { setEditMessage(null); setText('') }}
      />
    </div>
  )
}
