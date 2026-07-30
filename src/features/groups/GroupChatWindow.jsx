import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabaseClient'
import MessageBubble from '../../components/MessageBubble'
import MessageInput from '../../components/MessageInput'
import EmptyState from '../../ui/EmptyState'
import Skeleton from '../../ui/Skeleton'
import { DateSeparator, MessageContextMenu, TypingIndicator, ChatHeader } from '../../components/shared'
import { fetchGroupMessages, sendGroupMessage, editGroupMessage, deleteGroupMessage } from '../../services/messageService'
import { fetchGroupMembers } from '../../services/groupService'
import { shouldShowDateSeparator } from '../../lib/utils'
import { MESSAGE_PAGE_SIZE, TYPING_TIMEOUT } from '../../lib/constants'

export default function GroupChatWindow({ group }) {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
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
    const { data, error } = await fetchGroupMessages(group.id, MESSAGE_PAGE_SIZE)
    if (!error && data) setMessages(data)
    setLoading(false)
  }, [group])

  const fetchMembers = useCallback(async () => {
    if (!group) return
    const { data } = await fetchGroupMembers(group.id)
    if (data) setMembers(data)
  }, [group])

  useEffect(() => {
    fetchMessages()
    fetchMembers()
    setReplyTo(null)
    setEditMessage(null)
  }, [group?.id, fetchMessages, fetchMembers])

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
  }, [group, user, profile])

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
      await editGroupMessage(editMessage.id, { message_text: msgText.trim(), is_edited: true })
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

    const { error } = await sendGroupMessage(payload)
    if (!error) {
      setText('')
      setReplyTo(null)
    }
  }

  const handleDeleteMessage = async (msg, deleteForAll = false) => {
    if (deleteForAll && msg.sender_id === user.id) {
      await deleteGroupMessage(msg.id, true)
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
      <div className="flex-1 flex items-center justify-center h-full app-container">
        <EmptyState variant="generic" title="Select a group" description="Choose a group from the sidebar" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full app-container relative">
      <ChatHeader
        user={group}
        isGroup={true}
        memberCount={members.length}
        showInfo={showInfo}
        onToggleInfo={() => setShowInfo(!showInfo)}
      />

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1 relative"
        style={{ background: 'var(--surface-primary)' }}
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
                    reactions={[]}
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

        <TypingIndicator names={typingUsers} />

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
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <MessageContextMenu
        contextMenu={contextMenu}
        user={user}
        onReply={handleReply}
        onEdit={handleEdit}
        onDelete={handleDeleteMessage}
        onPin={async (m) => { await supabase.from('group_messages').update({ is_pinned: !m.is_pinned }).eq('id', m.id); setContextMenu(null) }}
        onClose={() => setContextMenu(null)}
      />

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
