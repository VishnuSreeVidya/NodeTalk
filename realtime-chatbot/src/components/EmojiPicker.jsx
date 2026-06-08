import { useState, useRef, useEffect } from 'react'

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
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 glass-strong rounded-2xl p-2 animate-fade-in z-30"
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
    </div>
  )
}
