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
      className="overflow-hidden border-b border-white/20"
    >
      <div className="p-3 flex items-center gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search in conversation..."
            value={query}
            onChange={handleChange}
            className="glass-input w-full pl-10 text-sm"
            autoFocus
            aria-label="Search in conversation"
          />
          {resultCount !== undefined && query && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-secondary)]">
              {resultCount} result{resultCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={handleClear}
          className="glass !p-2 !rounded-xl"
          aria-label="Close search"
        >
          <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}

export default memo(ChatSearchBar)
