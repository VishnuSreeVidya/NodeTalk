import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '../ui/Modal'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { formatMessageTime } from '../lib/utils'

export default function StarredMessagesModal({ open, onClose }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open || !user) return

    const fetchStarred = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          message_text,
          image_url,
          file_url,
          file_name,
          created_at,
          deleted_for_all,
          sender:profiles!messages_sender_id_fkey(username, avatar_url)
        `)
        .eq('is_starred', true)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setMessages(data)
      } else {
        setMessages([])
      }
      setLoading(false)
    }

    fetchStarred()
  }, [open, user])

  const handleUnstar = async (msgId) => {
    await supabase.from('messages').update({ is_starred: false }).eq('id', msgId)
    setMessages((prev) => prev.filter((m) => m.id !== msgId))
  }

  return (
    <Modal open={open} onClose={onClose} title="⭐ Starred Messages" maxWidth="max-w-lg">
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
        {loading ? (
          <div className="text-center py-10 opacity-60">
            <span className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin inline-block mb-2" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
            <p className="text-xs">Loading starred messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 opacity-60">
            <p className="text-3xl mb-2">⭐</p>
            <p className="text-sm font-semibold">No Starred Messages</p>
            <p className="text-xs mt-1">Star important messages to view them anytime here.</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-3 rounded-xl border flex items-start justify-between gap-3 relative group"
                style={{
                  background: 'var(--surface-tertiary)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-accent">
                      {msg.sender?.username || 'User'}
                    </span>
                    <span className="text-[10px] opacity-40">
                      {formatMessageTime(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed break-words" style={{ color: 'var(--text-primary)' }}>
                    {msg.deleted_for_all ? '🚫 This message was deleted' : msg.message_text || (msg.image_url ? '📷 Image' : '📎 File')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUnstar(msg.id)}
                  className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-yellow-500/10 text-yellow-500 transition-all flex-shrink-0"
                  title="Unstar message"
                >
                  ★
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </Modal>
  )
}
