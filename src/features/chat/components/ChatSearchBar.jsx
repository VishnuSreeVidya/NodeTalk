import { useState, useCallback, memo } from 'react'
import { motion } from 'framer-motion'

/**
 * Inline search bar within a conversation.
 * Searches messages by text with highlighting.
 */
function ChatSearchBar({ onSearch, onClose, resultCount }) {
  const [query, setQuery] = useState('')

  const handleChange = useCallback((e) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value)
  }, [onSearch])

  const handleClear = useCallback(() => {
    setQuery('')
    onSearch('')
    onClose?.()
  }, [onSearch, onClose])

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden border-b"
      style={{ borderColor: 'var(--border-primary)' }}
    >
      <div className="p-2.5 flex items-center gap-2" style={{ background: 'var(--surface-primary)' }}>
        <div className="relative flex-1">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search in conversation..."
            value={query}
            onChange={handleChange}
            className="surface-input w-full pl-8"
            autoFocus
            aria-label="Search in conversation"
          />
          {resultCount !== undefined && query && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-2xs" style={{ color: 'var(--text-tertiary)' }}>
              {resultCount} result{resultCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={handleClear}
          className="surface-icon-btn"
          aria-label="Close search"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}

export default memo(ChatSearchBar)
