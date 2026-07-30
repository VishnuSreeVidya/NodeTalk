import { memo } from 'react'
import { motion } from 'framer-motion'
import { formatDateSeparator } from '../../lib/utils'

function DateSeparator({ date }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center my-3"
    >
      <div
        className="px-3 py-1 rounded-full"
        style={{
          background: 'var(--surface-tertiary)',
          border: '1px solid var(--border-primary)',
        }}
      >
        <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
          {formatDateSeparator(date)}
        </span>
      </div>
    </motion.div>
  )
}

export default memo(DateSeparator)
