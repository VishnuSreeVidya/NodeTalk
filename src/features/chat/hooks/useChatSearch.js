import { useState, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'

/**
 * Lightweight in-conversation search hook.
 * Searches messages within a specific conversation by text.
 *
 * @param {string} conversationId - The conversation/user/group ID
 * @param {string} type - 'dm' or 'group'
 * @returns {Object} Search state and methods
 */
export default function useChatSearch(conversationId, type = 'dm') {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (searchQuery) => {
    const q = searchQuery || ''
    setQuery(q)

    if (!q.trim() || !conversationId) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const table = type === 'group' ? 'group_messages' : 'messages'

      let queryBuilder = supabase
        .from(table)
        .select('*')
        .ilike('message_text', `%${q.trim()}%`)
        .order('created_at', { ascending: false })
        .limit(50)

      if (type === 'group') {
        queryBuilder = queryBuilder.eq('group_id', conversationId)
      } else {
        queryBuilder = queryBuilder.or(
          `sender_id.eq.${conversationId},receiver_id.eq.${conversationId}`
        )
      }

      const { data } = await queryBuilder
      setResults(data || [])
    } catch (err) {
      console.error('Chat search failed:', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [conversationId, type])

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
  }, [])

  return {
    query,
    results,
    loading,
    search,
    clearSearch,
    resultCount: results.length,
  }
}
