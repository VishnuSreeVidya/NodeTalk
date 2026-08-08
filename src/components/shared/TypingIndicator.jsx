import { memo } from 'react'
import { motion } from 'framer-motion'

function TypingIndicator({ names = {} }) {
  const nameList = Object.values(names)
  if (nameList.length === 0) return null

  const text = nameList.length === 1
    ? `${nameList[0]} is typing...`
    : `${nameList.join(', ')} are typing...`

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex justify-start"
    >
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: 'var(--surface-tertiary)' }}
      >
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="text-xs ml-1" style={{ color: 'var(--text-tertiary)' }}>
          {text}
        </span>
      </div>
    </motion.div>
  )
}

function SingleTypingIndicator({ username }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="flex justify-start my-1"
    >
      <div
        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl rounded-bl-[4px] border"
        style={{
          background: 'var(--bubble-other)',
          borderColor: 'var(--border-primary)',
          boxShadow: 'var(--shadow-bubble)',
        }}
      >
        <div className="flex items-center gap-1 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: 'var(--accent)' }} />
          <span className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: 'var(--accent)' }} />
          <span className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: 'var(--accent)' }} />
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
          {username ? `${username} is typing...` : 'typing...'}
        </span>
      </div>
    </motion.div>
  )
}

export { SingleTypingIndicator }
export default memo(TypingIndicator)
