import { memo } from 'react'
import { motion } from 'framer-motion'

const VARIANTS = {
  accent: { bg: 'var(--accent)', color: 'white' },
  success: { bg: '#22c55e', color: 'white' },
  danger: { bg: '#ef4444', color: 'white' },
  warning: { bg: '#f59e0b', color: 'white' },
  neutral: { bg: 'rgba(255,255,255,0.15)', color: 'var(--text-secondary)' },
}

const SIZES = {
  sm: 'text-[9px] min-w-[16px] h-4 px-1',
  md: 'text-[10px] min-w-[20px] h-5 px-1.5',
  lg: 'text-xs min-w-[24px] h-6 px-2',
}

function Badge({ count, variant = 'accent', size = 'md', className = '' }) {
  if (!count || count <= 0) return null
  const style = VARIANTS[variant] || VARIANTS.accent
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center justify-center rounded-full font-bold leading-none ${SIZES[size]} ${className}`}
      style={{ background: style.bg, color: style.color }}
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  )
}

export default memo(Badge)
