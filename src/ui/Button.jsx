import { memo } from 'react'
import { motion } from 'framer-motion'

const VARIANTS = {
  primary: 'surface-btn-primary',
  secondary: 'surface-btn-secondary',
  ghost: 'surface-btn-ghost',
  danger: 'surface-btn-danger',
}

const SIZES = {
  xs: 'px-2 py-1 text-2xs rounded-[6px]',
  sm: 'px-2.5 py-1.5 text-xs rounded-[8px]',
  md: 'px-4 py-2 text-sm rounded-[8px]',
  lg: 'px-5 py-2.5 text-sm rounded-[10px]',
  icon: 'p-2 rounded-[8px]',
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

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      disabled={disabled || loading}
      className={`surface-btn ${baseClass} ${sizeClass} ${isIcon ? '!p-2' : ''} ${className}`}
      style={style}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : children}
    </motion.button>
  )
}

export default memo(Button)
