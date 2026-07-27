import { memo } from 'react'
import { motion } from 'framer-motion'
import { formatDateSeparator } from '../../lib/utils'

function DateSeparator({ date }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center my-4"
    >
      <div className="glass-strong rounded-full px-4 py-1.5">
        <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
          {formatDateSeparator(date)}
        </span>
      </div>
    </motion.div>
  )
}

export default memo(DateSeparator)
