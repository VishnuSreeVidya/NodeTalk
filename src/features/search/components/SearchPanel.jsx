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
      className="overflow-hidden border-b border-white/20"
    >
      <div className="p-3 space-y-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search messages, images, files..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="glass-input w-full pl-10 text-sm"
              autoFocus
              aria-label="Search messages"
            />
          </div>
          <button
            type="button"
            onClick={() => { clearSearch(); onClose?.() }}
            className="glass !p-2 !rounded-xl"
            aria-label="Close search"
          >
            <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filters.type === type.id
                  ? 'text-white shadow-sm'
                  : 'glass text-[var(--text-secondary)] hover:bg-white/20'
              }`}
              style={filters.type === type.id ? { background: 'var(--accent)' } : undefined}
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
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)', borderTopColor: 'transparent' }} />
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="max-h-60 overflow-y-auto space-y-1">
            <p className="text-[10px] text-[var(--text-secondary)] font-medium px-1">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            {results.slice(0, 20).map((msg) => (
              <button
                key={msg.id}
                onClick={() => onSelectResult?.(msg)}
                className="w-full text-left p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--accent)]">
                      {msg.message_text || (msg.image_url ? '📷 Image' : '📎 File')}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                      {formatMessageTime(msg.created_at)}
                      {msg.is_edited && ' (edited)'}
                    </p>
                  </div>
                  {msg.image_url && (
                    <img src={msg.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" loading="lazy" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && results.length === 0 && filters.query && (
          <div className="text-center py-4">
            <p className="text-sm text-[var(--text-secondary)]">No results found</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default memo(SearchPanel)
