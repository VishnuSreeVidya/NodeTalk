import { memo, useCallback } from 'react'
import { motion } from 'framer-motion'

function MessageContextMenu({ contextMenu, user, onReply, onEdit, onDelete, onPin, onClose }) {
  const message = contextMenu?.message

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message?.message_text || '')
    onClose()
  }, [message?.message_text, onClose])

  if (!message || !contextMenu) return null

  const isOwn = message.sender_id === user?.id
  const x = Math.min(contextMenu.x, window.innerWidth - 200)
  const y = Math.min(contextMenu.y, window.innerHeight - 300)

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-[60] glass-strong rounded-2xl p-2 shadow-xl min-w-[180px]"
        style={{ left: x, top: y }}
        role="menu"
        aria-label="Message actions"
      >
        <button
          onClick={handleCopy}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--text-primary)] hover:bg-white/10 transition-colors"
          role="menuitem"
        >
          📋 Copy
        </button>
        <button
          onClick={() => { onReply(message); onClose() }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--text-primary)] hover:bg-white/10 transition-colors"
          role="menuitem"
        >
          ↩️ Reply
        </button>
        {isOwn && (
          <>
            <button
              onClick={() => { onEdit(message); onClose() }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--text-primary)] hover:bg-white/10 transition-colors"
              role="menuitem"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => onDelete(message, false)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--text-primary)] hover:bg-white/10 transition-colors"
              role="menuitem"
            >
              🗑️ Delete
            </button>
            <button
              onClick={() => onDelete(message, true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              role="menuitem"
            >
              🗑️ Delete for everyone
            </button>
          </>
        )}
        <button
          onClick={() => onPin(message)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--text-primary)] hover:bg-white/10 transition-colors"
          role="menuitem"
        >
          📌 {message.is_pinned ? 'Unpin' : 'Pin'}
        </button>
      </motion.div>
    </>
  )
}

export default memo(MessageContextMenu)
