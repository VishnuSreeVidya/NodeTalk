import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabaseClient'
import MessageBubble from '../../components/MessageBubble'
import MessageInput from '../../components/MessageInput'
import EmptyState from '../../ui/EmptyState'
import Skeleton from '../../ui/Skeleton'
import { DateSeparator, MessageContextMenu, TypingIndicator, ChatHeader } from '../../components/shared'
import MessageInfoModal from '../../components/shared/MessageInfoModal'
import ConfirmDeleteModal from '../../components/shared/ConfirmDeleteModal'
import { fetchGroupMessages, fetchOlderGroupMessages, sendGroupMessage, editGroupMessage, deleteGroupMessage } from '../../services/messageService'
import { fetchGroupMembers } from '../../services/groupService'
import { shouldShowDateSeparator } from '../../lib/utils'
import { MESSAGE_PAGE_SIZE, TYPING_TIMEOUT } from '../../lib/constants'
import { useChatScroll } from '../../hooks/useChatScroll'

export default function GroupChatWindow({ group }) {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [replyTo, setReplyTo] = useState(null)
  const [editMessage, setEditMessage] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const [selectedInfoMessage, setSelectedInfoMessage] = useState(null)
  const [confirmDeleteMessage, setConfirmDeleteMessage] = useState(null)
  const [showInfo, setShowInfo] = useState(false)
  const [members, setMembers] = useState([])
  const [typingUsers, setTypingUsers] = useState({})
  const bottomRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const inputRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const isTypingRef = useRef(false)

  const fetchMessages = useCallback(async () => {
    if (!group || !user) return
    setLoading(true)
    const { data, error } = await fetchGroupMessages(group.id, user.id, MESSAGE_PAGE_SIZE)
    if (!error && data) setMessages(data)
    setLoading(false)
  }, [group, user])

  const fetchMembers = useCallback(async () => {
    if (!group) return
    const { data } = await fetchGroupMembers(group.id)
    if (data) setMembers(data)
  }, [group])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'group_message_deletions', filter: `user_id=eq.${user?.id}` },
        (payload) => {
          const deletedMsgId = payload.new.group_message_id
          setMessages((prev) => prev.filter((m) => m.id !== deletedMsgId))
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

  const handleLoadOlder = useCallback(async () => {
    if (!group || !user || !messages.length || loadingOlder || !hasMore) return
    setLoadingOlder(true)
    const oldest = messages[0].created_at
    const { data } = await fetchOlderGroupMessages(group.id, user.id, oldest, MESSAGE_PAGE_SIZE)
    if (data && data.length > 0) {
      setMessages((prev) => [...data, ...prev])
      if (data.length < MESSAGE_PAGE_SIZE) setHasMore(false)
    } else {
      setHasMore(false)
    }
    setLoadingOlder(false)
  }, [group, user, messages, loadingOlder, hasMore])

  const {
    handleScroll,
    scrollToBottom,
    showScrollButton,
    unreadCount,
  } = useChatScroll({
    containerRef: messagesContainerRef,
    messages,
    currentUserId: user?.id,
    loading,
    hasMore,
    onLoadOlder: handleLoadOlder,
    chatId: group?.id,
  })

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

    const { data, error } = await sendGroupMessage(payload)
    if (!error) {
      setText('')
      setReplyTo(null)
      if (data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev
          return [...prev, data]
        })
      }
    }
  }

  const handleDeleteMessage = async (msg, mode = 'self') => {
    if (mode === 'everyone' || mode === true) {
      setConfirmDeleteMessage(msg)
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== msg.id))
      await deleteGroupMessage(msg.id, 'self', user.id)
    }
    setContextMenu(null)
  }

  const handleConfirmDeleteEveryone = async () => {
    if (!confirmDeleteMessage) return
    const targetMsg = confirmDeleteMessage
    setConfirmDeleteMessage(null)
    setMessages((prev) =>
      prev.map((m) => (m.id === targetMsg.id ? { ...m, deleted_for_all: true } : m))
    )
    await deleteGroupMessage(targetMsg.id, 'everyone', user.id)
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
    const isGroupAdmin = members.some((m) => m.user_id === user?.id && m.role === 'admin')
    setContextMenu({ x: e.clientX, y: e.clientY, message: msg, isGroupAdmin })
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

      {/* Scroll to bottom button / new messages badge */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 16 }}
            transition={{ duration: 0.15 }}
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold shadow-lg transition-transform hover:scale-105"
            style={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border-secondary)',
              color: unreadCount > 0 ? 'var(--accent)' : 'var(--text-primary)',
              boxShadow: 'var(--shadow-popover)',
            }}
            title="Scroll to bottom"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            {unreadCount > 0 ? (
              <span>{unreadCount} new message{unreadCount > 1 ? 's' : ''}</span>
            ) : null}
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
        onInfo={(m) => setSelectedInfoMessage(m)}
        onClose={() => setContextMenu(null)}
      />

      <MessageInfoModal
        open={!!selectedInfoMessage}
        onClose={() => setSelectedInfoMessage(null)}
        message={selectedInfoMessage}
      />

      <ConfirmDeleteModal
        isOpen={!!confirmDeleteMessage}
        onClose={() => setConfirmDeleteMessage(null)}
        onConfirm={handleConfirmDeleteEveryone}
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
