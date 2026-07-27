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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="glass-card px-4 py-3 flex items-center gap-2">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="text-[11px] text-[var(--text-secondary)] ml-1">
          {text}
        </span>
      </div>
    </motion.div>
  )
}

function SingleTypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="glass-card px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </motion.div>
  )
}

export { SingleTypingIndicator }
export default memo(TypingIndicator)
