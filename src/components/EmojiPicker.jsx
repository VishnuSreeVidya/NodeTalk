import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

const EMOJIS = [
  ['😊', '😂', '🥰', '😍', '🤔', '😎'],
  ['🙌', '👍', '👋', '🔥', '💯', '🎉'],
  ['❤️', '💔', '✨', '🌟', '⭐', '💡'],
  ['🎵', '🎶', '💪', '🤝', '🌈', '🎯'],
  ['🍕', '🍔', '🌮', '🍩', '☕', '🎂'],
  ['🎁', '🎈', '🚀', '🎮', '📱', '💻'],
  ['⌚', '🎧', '📷', '🎥', '🔔', '💾'],
  ['📌', '📍', '🎨', '🎭', '🐱', '🌻'],
]

export default function EmojiPicker({ onSelect, open, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  if (!open) return null

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ duration: 0.12 }}
      className="absolute bottom-full left-0 mb-2 z-30 p-1.5"
      style={{
        background: 'var(--surface-elevated)',
        border: '1px solid var(--border-secondary)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-popover)',
      }}
    >
      {EMOJIS.map((row, i) => (
        <div key={i} className="emoji-grid" style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}>
          {row.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSelect(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      ))}
    </motion.div>
  )
}
