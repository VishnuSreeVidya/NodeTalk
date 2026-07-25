import { memo } from 'react'
import { motion } from 'framer-motion'

const VARIANTS = {
  primary: 'glass-btn-primary',
  secondary: 'glass-btn',
  ghost: '',
  danger: '',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-xl',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-2xl',
  icon: 'p-2.5 rounded-xl',
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  style,
  ...props
}) {
  const baseClass = VARIANTS[variant] || ''
  const sizeClass = SIZES[size] || SIZES.md
  const isIcon = size === 'icon'

  const ghostStyles = variant === 'ghost' ? {
    background: 'transparent',
    color: 'var(--text-secondary)',
    ...style,
  } : variant === 'danger' ? {
    background: 'rgba(239,68,68,0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.2)',
    ...style,
  } : style

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled || loading}
      className={`${baseClass} ${sizeClass} font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${isIcon ? '!p-2.5' : ''} ${className}`}
      style={ghostStyles}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current/50 border-t-transparent rounded-full animate-spin" />
      ) : children}
    </motion.button>
  )
}

export default memo(Button)
