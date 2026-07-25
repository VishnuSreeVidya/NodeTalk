import { memo } from 'react'
import { motion } from 'framer-motion'

const VARIANTS = {
  chat: {
    icon: '💬',
    title: 'No messages yet',
    description: 'Say hello to start a conversation',
  },
  search: {
    icon: '🔍',
    title: 'No results found',
    description: 'Try a different search term',
  },
  users: {
    icon: '👥',
    title: 'No users online',
    description: 'Check back later',
  },
  groups: {
    icon: '🏠',
    title: 'No groups yet',
    description: 'Create a group to get started',
  },
  generic: {
    icon: '✨',
    title: 'Nothing here',
    description: 'This space is empty',
  },
}

function EmptyState({ variant = 'generic', title, description, action, className = '' }) {
  const defaults = VARIANTS[variant] || VARIANTS.generic

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-16 px-8 text-center ${className}`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, delay: 0.1 }}
        className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-6"
        style={{ background: 'color-mix(in srgb, var(--accent) 8%, transparent)' }}
      >
        {defaults.icon}
      </motion.div>
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
        {title || defaults.title}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-xs mb-6">
        {description || defaults.description}
      </p>
      {action && <div>{action}</div>}
    </motion.div>
  )
}

export default memo(EmptyState)
