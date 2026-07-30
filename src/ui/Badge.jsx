import { memo } from 'react'
import { motion } from 'framer-motion'

function Badge({ count, className = '' }) {
  if (!count || count <= 0) return null
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`surface-badge ${className}`}
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  )
}

export default memo(Badge)
