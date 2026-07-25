import { memo } from 'react'
import { motion } from 'framer-motion'

function ReplyPreview({ replyMsg, onCancel, label = 'Replying to' }) {
  if (!replyMsg) return null

  const preview = replyMsg.message_text || '📷 Image'

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className="reply-preview"
    >
      <div className="reply-preview-bar" />
      <div className="flex-1 min-w-0">
        <p className="reply-preview-name">{label}</p>
        <p className="reply-preview-text">{preview}</p>
      </div>
      {onCancel && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onCancel}
          className="reply-preview-close"
          title="Cancel"
        >
          &times;
        </motion.button>
      )}
    </motion.div>
  )
}

export default memo(ReplyPreview)
