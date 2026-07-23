import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'

export default function ChatWindow({ selectedUser, onStartCall }) {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [receiverTyping, setReceiverTyping] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const bottomRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const isTypingRef = useRef(false)
  const inputRef = useRef(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const fetchMessages = async () => {
    if (!selectedUser) return
    setLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch messages:', error.message)
    } else if (data) {
      setMessages(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!selectedUser) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages()
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
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedUser?.id]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const sendMessage = async (msgText, imageUrl) => {
    const payload = {
      sender_id: user.id,
      receiver_id: selectedUser.id,
    }
    if (imageUrl) {
      payload.image_url = imageUrl
      payload.message_text = msgText || '📷 Image'
    } else {
      if (!msgText?.trim()) return
      payload.message_text = msgText.trim()
    }

    const { error } = await supabase.from('messages').insert(payload)

    if (!error) {
      setText('')
    } else {
      console.error('Failed to send message:', error.message)
    }
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

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center app-container" style={{ background: 'var(--chat-bg)' }}>
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center text-4xl" style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
            💬
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Welcome to NodeTalk</h2>
          <p className="text-[var(--text-secondary)] mt-2">Select a user from the sidebar to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full app-container relative" style={{ background: 'var(--chat-bg)' }}>
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 glass flex items-center gap-3 rounded-none">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm" style={{ background: 'var(--accent)' }}>
            {selectedUser.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <span className={`presence-dot absolute -bottom-0.5 -right-0.5 ${selectedUser.is_online ? 'online' : 'offline'}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--text-primary)]">{selectedUser.username}</p>
          <p className="text-xs text-[var(--text-secondary)]">
            {receiverTyping
              ? <span className="animate-fade-in" style={{ color: 'var(--accent)' }}>typing...</span>
              : (selectedUser.is_online ? 'Online' : 'Offline')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStartCall?.('audio')}
            className="glass !p-2.5 !rounded-xl transition-all hover:bg-[var(--accent)]/10"
            title="Voice call"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button
            onClick={() => onStartCall?.('video')}
            className="glass !p-2.5 !rounded-xl transition-all hover:bg-[var(--accent)]/10"
            title="Video call"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 relative"
      >
        {loading && (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className="skeleton w-48 h-12" />
              </div>
            ))}
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center text-[var(--text-secondary)] py-12 text-sm animate-fade-in">
            No messages yet. Say hello!
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender_id === user.id} />
        ))}

        {receiverTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="glass-card px-4 py-3 flex items-center gap-1.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 glass-strong rounded-full p-2.5 shadow-lg z-10 animate-fade-in hover:scale-110 transition-transform"
          style={{ color: 'var(--accent)' }}
          title="Jump to latest"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      {/* Input */}
      <MessageInput
        ref={inputRef}
        text={text}
        setText={setText}
        showEmoji={showEmoji}
        setShowEmoji={setShowEmoji}
        onEmojiSelect={handleEmojiSelect}
        onImageUpload={handleImageUpload}
        onSubmit={handleSubmit}
        selectedUser={selectedUser}
        onTyping={broadcastTyping}
      />
    </div>
  )
}
