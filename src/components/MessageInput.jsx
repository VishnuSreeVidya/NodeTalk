import { forwardRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EmojiPicker from './EmojiPicker'
import ImageUpload from './ImageUpload'
import ReplyPreview from './ReplyPreview'

const MessageInput = forwardRef(function MessageInput(
  { text, setText, showEmoji, setShowEmoji, onEmojiSelect, onImageUpload, onSubmit, selectedUser, onTyping, replyTo, editMessage, onCancelReply, onCancelEdit },
  inputRef
) {
  const [dragOver, setDragOver] = useState(false)

  const handleChange = (e) => {
    setText(e.target.value)
    if (selectedUser) onTyping?.()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e)
    }
    if (e.key === 'Escape') {
      if (editMessage) onCancelEdit?.()
      else if (replyTo) onCancelReply?.()
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      onImageUpload(url)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="p-3 border-t border-white/20 glass rounded-none backdrop-blur-xl"
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Reply / Edit preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <ReplyPreview replyMsg={replyTo} onCancel={onCancelReply} label="Replying to" />
          </motion.div>
        )}
        {editMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <ReplyPreview replyMsg={editMessage} onCancel={onCancelEdit} label="Editing" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag overlay */}
      <AnimatePresence>
        {dragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed"
            style={{ borderColor: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 5%, transparent)' }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>Drop image here</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        <div className="relative">
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowEmoji(!showEmoji)}
            className="glass !p-2.5 !rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.button>
          <EmojiPicker
            open={showEmoji}
            onSelect={onEmojiSelect}
            onClose={() => setShowEmoji(false)}
          />
        </div>
        <ImageUpload onUpload={onImageUpload} disabled={!selectedUser} />
        <input
          ref={inputRef}
          type="text"
          placeholder={editMessage ? 'Edit message...' : 'Type a message...'}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="glass-input flex-1"
          autoFocus
        />
        <motion.button
          type="submit"
          disabled={!text.trim()}
          whileTap={{ scale: 0.9 }}
          className="glass-btn-primary !p-2.5 disabled:opacity-30"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
          </svg>
        </motion.button>
      </div>
    </form>
  )
})

export default MessageInput
