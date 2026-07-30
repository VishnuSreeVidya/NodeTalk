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

function SingleTypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex justify-start"
    >
      <div
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg"
        style={{ background: 'var(--surface-tertiary)' }}
      >
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </motion.div>
  )
}

export { SingleTypingIndicator }
export default memo(TypingIndicator)
