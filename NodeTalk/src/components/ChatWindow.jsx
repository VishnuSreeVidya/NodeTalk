import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { format } from 'date-fns'
import EmojiPicker from './EmojiPicker'
import ImageUpload from './ImageUpload'

export default function ChatWindow({ selectedUser, onStartCall }) {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [receiverTyping, setReceiverTyping] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const bottomRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const isTypingRef = useRef(false)
  const inputRef = useRef(null)

  const fetchMessages = async () => {
    if (!selectedUser) return
    setLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })

    if (!error && data) setMessages(data)
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
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${selectedUser.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedUser?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender_id: user.id,
          receiver_id: selectedUser.id,
          message_text: payload.message_text,
          image_url: imageUrl || null,
          created_at: new Date().toISOString(),
        },
      ])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(text, null)
  }

  const handleInputChange = (e) => {
    setText(e.target.value)
    if (selectedUser) broadcastTyping()
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
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#6D61FF]/10 flex items-center justify-center text-4xl">
            💬
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Welcome to NodeTalk</h2>
          <p className="text-[var(--text-secondary)] mt-2">Select a user from the sidebar to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full app-container" style={{ background: 'var(--chat-bg)' }}>
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 glass flex items-center gap-3 rounded-none">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#6D61FF] flex items-center justify-center text-sm font-bold text-white shadow-sm">
            {selectedUser.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <span className={`presence-dot absolute -bottom-0.5 -right-0.5 ${selectedUser.is_online ? 'online' : 'offline'}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--text-primary)]">{selectedUser.username}</p>
          <p className="text-xs text-[var(--text-secondary)]">
            {receiverTyping
              ? <span className="text-[#6D61FF] animate-fade-in">typing...</span>
              : (selectedUser.is_online ? 'Online' : 'Offline')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStartCall?.('audio')}
            className="glass !p-2.5 !rounded-xl hover:bg-[#6D61FF]/10 transition-all"
            title="Voice call"
          >
            <svg className="w-5 h-5 text-[#6D61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button
            onClick={() => onStartCall?.('video')}
            className="glass !p-2.5 !rounded-xl hover:bg-[#6D61FF]/10 transition-all"
            title="Video call"
          >
            <svg className="w-5 h-5 text-[#6D61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-purple-400/50 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center text-[var(--text-secondary)] py-12 text-sm animate-fade-in">
            No messages yet. Say hello!
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.sender_id === user.id
          const time = format(new Date(msg.created_at), 'hh:mm a')
          const hasImage = !!msg.image_url
          const hasText = !!msg.message_text && msg.message_text !== '📷 Image'

          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                  isOwn ? 'rounded-br-md' : 'rounded-bl-md'
                } shadow-sm`}
                style={{
                  background: isOwn ? 'var(--bubble-own)' : 'var(--bubble-other)',
                  border: isOwn ? '1px solid rgba(109,97,255,0.3)' : '1px solid rgba(0,0,0,0.06)',
                }}
              >
                {hasImage && (
                  <img
                    src={msg.image_url}
                    alt="Shared image"
                    className="chat-image mb-1"
                    onClick={() => window.open(msg.image_url, '_blank')}
                  />
                )}
                {hasText && (
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isOwn ? 'text-white' : 'text-[var(--bubble-other-text)]'}`}>
                    {msg.message_text}
                  </p>
                )}
                <p className={`text-[10px] mt-1 ${isOwn ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                  {time}
                </p>
              </div>
            </div>
          )
        })}

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

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 glass rounded-none">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className="glass !p-3 !rounded-xl hover:bg-[#6D61FF]/10 transition-all"
            >
              <svg className="w-5 h-5 text-[#6D61FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <EmojiPicker
              open={showEmoji}
              onSelect={handleEmojiSelect}
              onClose={() => setShowEmoji(false)}
            />
          </div>
          <ImageUpload onUpload={handleImageUpload} disabled={!selectedUser} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={handleInputChange}
            className="glass-input flex-1"
            autoFocus
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="glass-btn-primary !p-3 disabled:opacity-30"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}
