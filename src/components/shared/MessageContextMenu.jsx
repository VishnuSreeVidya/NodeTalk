import { memo, useCallback } from 'react'
import { motion } from 'framer-motion'

function MessageContextMenu({ contextMenu, user, onReply, onEdit, onDelete, onPin, onInfo, onClose }) {
  const message = contextMenu?.message

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message?.message_text || '')
    onClose()
  }, [message?.message_text, onClose])

  if (!message || !contextMenu) return null

  const isOwn = message.sender_id === user?.id
  const canDeleteForEveryone = isOwn || contextMenu?.isGroupAdmin
  const x = Math.min(contextMenu.x, window.innerWidth - 200)
  const y = Math.min(contextMenu.y, window.innerHeight - 300)

  const isDeleted = !!message.deleted_for_all

  const items = isDeleted ? [
    { label: 'Delete for me', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', action: () => { onDelete(message, 'self'); onClose() }, danger: false },
  ] : [
    { label: 'Copy', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-2a2 2 0 00-2-2h-8a2 2 0 00-2 2v2a2 2 0 002 2z', action: handleCopy },
    { label: 'Reply', icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6', action: () => { onReply(message); onClose() } },
    { label: 'Message Info', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', action: () => { onInfo?.(message); onClose() } },
    ...(isOwn ? [
      { label: 'Edit', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', action: () => { onEdit(message); onClose() } },
    ] : []),
    { label: 'Delete for me', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', action: () => { onDelete(message, 'self'); onClose() }, danger: false },
    ...(canDeleteForEveryone ? [
      { label: 'Delete for everyone', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', action: () => { onDelete(message, 'everyone'); onClose() }, danger: true },
    ] : []),
    { label: message.is_pinned ? 'Unpin' : 'Pin', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z', action: () => onPin(message) },
  ]

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.12 }}
        className="fixed z-[60] min-w-[180px] py-1"
        style={{
          left: x, top: y,
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border-secondary)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-popover)',
        }}
        role="menu"
        aria-label="Message actions"
      >
        {items.map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
            style={{
              color: item.danger ? 'var(--danger)' : 'var(--text-primary)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = item.danger ? 'color-mix(in srgb, var(--danger) 10%, transparent)' : 'var(--surface-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            role="menuitem"
          >
            <svg className="w-4 h-4 flex-shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
            </svg>
            {item.label}
          </button>
        ))}
      </motion.div>
    </>
  )
}

export default memo(MessageContextMenu)
