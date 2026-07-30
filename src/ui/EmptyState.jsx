import { memo } from 'react'
import { motion } from 'framer-motion'

const VARIANTS = {
  chat: {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'No messages yet',
    description: 'Say hello to start a conversation',
  },
  search: {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'No results found',
    description: 'Try a different search term',
  },
  generic: {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    title: 'Nothing here',
    description: 'This space is empty',
  },
}

function EmptyState({ variant = 'generic', title, description, action, className = '' }) {
  const defaults = VARIANTS[variant] || VARIANTS.generic

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-col items-center justify-center py-16 px-8 text-center ${className}`}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 18, delay: 0.05 }}
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
        style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
      >
        {defaults.icon}
      </motion.div>
      <h3 className="text-base font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
        {title || defaults.title}
      </h3>
      <p className="text-sm max-w-xs" style={{ color: 'var(--text-secondary)' }}>
        {description || defaults.description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}

export default memo(EmptyState)
