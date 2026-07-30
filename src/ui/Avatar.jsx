import { memo } from 'react'

const SIZES = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg',
  '2xl': 'w-20 h-20 text-2xl',
}

const RADIUS = {
  xs: 'rounded-[4px]',
  sm: 'rounded-[6px]',
  md: 'rounded-[8px]',
  lg: 'rounded-[10px]',
  xl: 'rounded-[12px]',
  '2xl': 'rounded-[14px]',
}

function Avatar({ src, username, size = 'md', isOnline, className = '' }) {
  const initial = username?.charAt(0).toUpperCase() || '?'
  const sizeClass = RADIUS[size] || RADIUS.md

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={username}
          className={`${SIZES[size]} ${sizeClass} object-cover`}
          style={{ boxShadow: 'var(--shadow-soft)' }}
        />
      ) : (
        <div
          className={`${SIZES[size]} ${sizeClass} flex items-center justify-center font-semibold text-white`}
          style={{ background: 'var(--accent)' }}
        >
          {initial}
        </div>
      )}
      {typeof isOnline === 'boolean' && (
        <span
          className={`presence-dot absolute -bottom-0.5 -right-0.5 ${isOnline ? 'online' : 'offline'}`}
        />
      )}
    </div>
  )
}

export default memo(Avatar)
