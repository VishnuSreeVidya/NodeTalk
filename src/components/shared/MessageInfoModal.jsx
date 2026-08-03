import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'

export default function MessageInfoModal({ open, onClose, message, decryptedText }) {
  if (!open || !message) return null

  const sentTime = message.created_at ? format(new Date(message.created_at), 'MMMM d, yyyy - hh:mm:ss a') : 'Unknown'
  const readTime = message.read_at ? format(new Date(message.read_at), 'MMMM d, yyyy - hh:mm:ss a') : null
  const displayText = decryptedText || message.message_text || '📷 Media'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md overflow-hidden rounded-xl p-5 z-10"
          style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-secondary)',
            boxShadow: 'var(--shadow-popover)',
          }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-primary)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Message Info</h3>
            <button onClick={onClose} className="surface-icon-btn">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="py-4 space-y-4">
            {/* Message Preview */}
            <div className="p-3 rounded-lg border text-xs" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-primary)' }}>
              <p className="font-mono opacity-80 whitespace-pre-wrap break-words">{displayText}</p>
            </div>

            {/* Timestamps */}
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-full mt-0.5" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Sent</p>
                  <p className="opacity-70 mt-0.5">{sentTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-full mt-0.5" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Delivered</p>
                  <p className="opacity-70 mt-0.5">{message.message_status === 'sent' ? 'Sent to server' : 'Delivered to recipient device'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-full mt-0.5" style={{ background: message.read_at ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--surface-hover)', color: message.read_at ? 'var(--accent)' : 'var(--text-tertiary)' }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Read</p>
                  <p className="opacity-70 mt-0.5">{readTime || 'Not read yet'}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
