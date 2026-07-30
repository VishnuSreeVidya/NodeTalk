import { useState, useCallback, memo } from 'react'
import { motion } from 'framer-motion'
import useSearch from '../hooks/useSearch'
import { formatMessageTime } from '../../../lib/utils'

const SEARCH_TYPES = [
  { id: 'all', label: 'All', icon: '🔍' },
  { id: 'messages', label: 'Messages', icon: '💬' },
  { id: 'images', label: 'Images', icon: '🖼️' },
  { id: 'videos', label: 'Videos', icon: '🎬' },
  { id: 'documents', label: 'Docs', icon: '📄' },
  { id: 'voice', label: 'Voice', icon: '🎵' },
  { id: 'links', label: 'Links', icon: '🔗' },
]

function SearchPanel({ userId, onSelectResult, onClose }) {
  const { results, loading, filters, search, updateFilters, clearSearch } = useSearch(userId)
  const [query, setQuery] = useState('')

  const handleSearch = useCallback((e) => {
    e.preventDefault()
    updateFilters({ query })
    search({ ...filters, query })
  }, [query, filters, updateFilters, search])

  const handleTypeFilter = useCallback((type) => {
    const newFilters = { ...filters, type }
    updateFilters(newFilters)
    search(newFilters)
  }, [filters, updateFilters, search])

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden border-b"
      style={{ borderColor: 'var(--border-primary)' }}
    >
      <div className="p-3 space-y-3" style={{ background: 'var(--surface-primary)' }}>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search messages, images, files..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="surface-input w-full pl-8"
              autoFocus
              aria-label="Search messages"
            />
          </div>
          <button
            type="button"
            onClick={() => { clearSearch(); onClose?.() }}
            className="surface-icon-btn"
            aria-label="Close search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </form>

        {/* Type filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1" role="radiogroup" aria-label="Search filter type">
          {SEARCH_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeFilter(type.id)}
              className="flex-shrink-0 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: filters.type === type.id ? 'var(--accent)' : 'var(--surface-tertiary)',
                color: filters.type === type.id ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border-primary)',
              }}
              role="radio"
              aria-checked={filters.type === type.id}
            >
              <span className="mr-1">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'color-mix(in srgb, var(--accent) 25%, transparent)', borderTopColor: 'transparent' }} />
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            <p className="text-2xs font-medium px-1" style={{ color: 'var(--text-tertiary)' }}>
              {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            {results.slice(0, 20).map((msg) => (
              <button
                key={msg.id}
                onClick={() => onSelectResult?.(msg)}
                className="w-full text-left p-2 rounded-lg transition-colors group"
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                      {msg.message_text || (msg.image_url ? '📷 Image' : '📎 File')}
                    </p>
                    <p className="text-2xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                      {formatMessageTime(msg.created_at)}
                      {msg.is_edited && ' (edited)'}
                    </p>
                  </div>
                  {msg.image_url && (
                    <img src={msg.image_url} alt="" className="w-9 h-9 rounded-[6px] object-cover flex-shrink-0" loading="lazy" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && results.length === 0 && filters.query && (
          <div className="text-center py-4">
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No results found</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default memo(SearchPanel)
