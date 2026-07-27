import { memo } from 'react'
import { motion } from 'framer-motion'
import Avatar from '../../ui/Avatar'
import { formatLastSeen } from '../../lib/utils'

function ChatHeader({ user, isGroup, memberCount, receiverTyping, sharedKey, onSearchToggle, onStartAudioCall, onStartVideoCall, onToggleInfo }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border-b border-white/20 glass flex items-center gap-3 rounded-none backdrop-blur-xl"
    >
      <Avatar
        username={user?.username || user?.name}
        size="md"
        isOnline={!isGroup ? user?.is_online : undefined}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[var(--text-primary)] truncate">
          {user?.username || user?.name}
        </p>
        <p className="text-[11px] text-[var(--text-secondary)]">
          {receiverTyping ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: 'var(--accent)' }}
              className="font-medium"
            >
              typing...
            </motion.span>
          ) : isGroup ? (
            `${memberCount} members`
          ) : user?.is_online ? (
            'Online'
          ) : (
            formatLastSeen(user?.last_seen)
          )}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        {sharedKey && !isGroup && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 glass !px-2 !py-1 !rounded-lg"
            title="End-to-end encrypted"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-[10px] font-bold" style={{ color: 'var(--accent)' }}>E2EE</span>
          </motion.div>
        )}
        {!isGroup && (
          <>
            <button
              onClick={onSearchToggle}
              className="glass !p-2 !rounded-xl transition-all hover:bg-white/20"
              style={{ color: 'var(--text-secondary)' }}
              title="Search messages"
              aria-label="Search messages"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              onClick={onStartAudioCall}
              className="glass !p-2 !rounded-xl transition-all hover:bg-white/20"
              style={{ color: 'var(--text-secondary)' }}
              title="Voice call"
              aria-label="Start voice call"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            <button
              onClick={onStartVideoCall}
              className="glass !p-2 !rounded-xl transition-all hover:bg-white/20"
              style={{ color: 'var(--text-secondary)' }}
              title="Video call"
              aria-label="Start video call"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </>
        )}
        {isGroup && (
          <button
            onClick={onToggleInfo}
            className="glass !p-2 !rounded-xl transition-all hover:bg-white/20"
            style={{ color: 'var(--text-secondary)' }}
            title="Group info"
            aria-label="Toggle group info"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default memo(ChatHeader)
