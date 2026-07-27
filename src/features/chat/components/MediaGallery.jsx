import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../lib/supabase'
import { formatMessageTime } from '../../../lib/utils'
import Modal from '../../../ui/Modal'

const TABS = [
  { id: 'media', label: 'Media', icon: '🖼️' },
  { id: 'files', label: 'Files', icon: '📄' },
  { id: 'links', label: 'Links', icon: '🔗' },
  { id: 'voice', label: 'Voice', icon: '🎵' },
]

function MediaGallery({ open, onClose, userId, otherUserId, groupId }) {
  const [activeTab, setActiveTab] = useState('media')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        let query
        const isGroup = !!groupId

        if (isGroup) {
          query = supabase
            .from('group_messages')
            .select('*')
            .eq('group_id', groupId)
            .order('created_at', { ascending: false })
            .limit(200)
        } else {
          query = supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
            .order('created_at', { ascending: false })
            .limit(200)
        }

        const { data } = await query
        const messages = data || []

        let filtered = []
        switch (activeTab) {
          case 'media':
            filtered = messages.filter((m) => m.image_url)
            break
          case 'files':
            filtered = messages.filter((m) => m.file_url && m.file_type !== 'audio')
            break
          case 'links':
            filtered = messages.filter((m) => m.message_text?.includes('http'))
            break
          case 'voice':
            filtered = messages.filter((m) => m.file_type === 'audio')
            break
        }

        if (!cancelled) setItems(filtered)
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [open, userId, otherUserId, groupId, activeTab])

  const extractLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text?.match(urlRegex) || []
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title="Media Gallery" maxWidth="max-w-2xl">
        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-all relative ${
                activeTab === tab.id
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)', borderTopColor: 'transparent' }} />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">📭</p>
              <p className="text-sm text-[var(--text-secondary)]">No {activeTab} found</p>
            </div>
          ) : activeTab === 'media' ? (
            <div className="grid grid-cols-3 gap-2">
              {items.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setPreviewImage(msg.image_url)}
                  className="aspect-square rounded-xl overflow-hidden hover:opacity-80 transition-opacity"
                >
                  <img src={msg.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          ) : activeTab === 'links' ? (
            <div className="space-y-2">
              {items.map((msg) => (
                <div key={msg.id} className="glass rounded-xl p-3">
                  {extractLinks(msg.message_text).map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline block truncate"
                      style={{ color: 'var(--accent)' }}
                    >
                      {link}
                    </a>
                  ))}
                  <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                    {formatMessageTime(msg.created_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((msg) => (
                <div key={msg.id} className="glass rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
                    {activeTab === 'files' ? '📄' : '🎵'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] truncate">{msg.file_name || 'File'}</p>
                    <p className="text-[10px] text-[var(--text-secondary)]">{formatMessageTime(msg.created_at)}</p>
                  </div>
                  <a
                    href={msg.file_url}
                    download
                    className="glass !p-2 !rounded-xl"
                    style={{ color: 'var(--accent)' }}
                    aria-label={`Download ${msg.file_name}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Fullscreen image preview */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={() => setPreviewImage(null)}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={previewImage}
              alt="Preview"
              className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl"
            />
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={() => setPreviewImage(null)}
              aria-label="Close preview"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default memo(MediaGallery)
