import { memo } from 'react'
import { motion } from 'framer-motion'

const PATTERNS = {
  message: [
    { w: 'w-48', h: 'h-12', align: 'justify-start' },
    { w: 'w-36', h: 'h-10', align: 'justify-end' },
    { w: 'w-56', h: 'h-12', align: 'justify-start' },
  ],
  user: [
    { w: 'w-full', h: 'h-14', align: '' },
    { w: 'w-full', h: 'h-14', align: '' },
    { w: 'w-full', h: 'h-14', align: '' },
  ],
  chat: [
    { w: 'w-32', h: 'h-4', align: 'justify-start' },
    { w: 'w-48', h: 'h-12', align: 'justify-start' },
    { w: 'w-40', h: 'h-12', align: 'justify-end' },
    { w: 'w-56', h: 'h-12', align: 'justify-start' },
    { w: 'w-36', h: 'h-10', align: 'justify-end' },
  ],
}

function Skeleton({ pattern = 'message', className = '' }) {
  const items = PATTERNS[pattern] || PATTERNS.message

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.08 }}
          className={`flex ${item.align}`}
        >
          <div
            className={`${item.w} ${item.h} rounded-xl`}
            style={{
              background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s ease-in-out infinite',
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}

export default memo(Skeleton)
