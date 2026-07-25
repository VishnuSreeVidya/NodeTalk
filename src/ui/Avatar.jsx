import { memo } from 'react'

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

function Avatar({ src, username, size = 'md', isOnline, className = '' }) {
  const initial = username?.charAt(0).toUpperCase() || '?'

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={username}
          className={`${SIZES[size]} rounded-2xl object-cover shadow-sm`}
        />
      ) : (
        <div
          className={`${SIZES[size]} rounded-2xl flex items-center justify-center font-bold text-white shadow-sm`}
          style={{ background: 'var(--accent)' }}
        >
          {initial}
        </div>
      )}
      {typeof isOnline === 'boolean' && (
        <span className={`presence-dot absolute -bottom-0.5 -right-0.5 ${isOnline ? 'online' : 'offline'}`} />
      )}
    </div>
  )
}

export default memo(Avatar)
