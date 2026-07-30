import { memo } from 'react'
import { motion } from 'framer-motion'

const PATTERNS = {
  message: [
    { w: 'w-48', h: 'h-10', align: 'justify-start' },
    { w: 'w-36', h: 'h-9', align: 'justify-end' },
    { w: 'w-56', h: 'h-10', align: 'justify-start' },
  ],
  user: [
    { w: 'w-full', h: 'h-12', align: '' },
    { w: 'w-full', h: 'h-12', align: '' },
    { w: 'w-full', h: 'h-12', align: '' },
  ],
  chat: [
    { w: 'w-32', h: 'h-3', align: 'justify-start' },
    { w: 'w-48', h: 'h-10', align: 'justify-start' },
    { w: 'w-40', h: 'h-10', align: 'justify-end' },
    { w: 'w-56', h: 'h-10', align: 'justify-start' },
    { w: 'w-36', h: 'h-9', align: 'justify-end' },
  ],
}

function Skeleton({ pattern = 'message', className = '' }) {
  const items = PATTERNS[pattern] || PATTERNS.message

  return (
    <div className={`space-y-2.5 ${className}`}>
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.06 }}
          className={`flex ${item.align}`}
        >
          <div className={`${item.w} ${item.h} skeleton-base`} />
        </motion.div>
      ))}
    </div>
  )
}

export default memo(Skeleton)
