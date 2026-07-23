import { forwardRef } from 'react'
import EmojiPicker from './EmojiPicker'
import ImageUpload from './ImageUpload'

const MessageInput = forwardRef(function MessageInput(
  { text, setText, showEmoji, setShowEmoji, onEmojiSelect, onImageUpload, onSubmit, selectedUser, onTyping },
  inputRef
) {
  const handleChange = (e) => {
    setText(e.target.value)
    if (selectedUser) onTyping?.()
  }

  return (
    <form onSubmit={onSubmit} className="p-4 border-t border-gray-200 glass rounded-none">
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="glass !p-3 !rounded-xl transition-all"
            style={{ '--hover-bg': 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
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
          placeholder="Type a message..."
          value={text}
          onChange={handleChange}
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
  )
})

export default MessageInput
