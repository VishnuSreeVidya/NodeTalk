import { useState, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'

/**
 * Advanced search hook supporting multiple content types and filters.
 * 
 * @param {string} userId - Current user ID
 * @returns {Object} Search state and methods
 */
export default function useSearch(userId) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    query: '',
    type: 'all', // 'all' | 'messages' | 'images' | 'videos' | 'documents' | 'voice' | 'links'
    sender: null, // user ID or null for all
    dateFrom: null,
    dateTo: null,
    groupId: null, // null = DMs only, string = specific group
  })

  const search = useCallback(async (searchFilters) => {
    const f = searchFilters || filters
    if (!f.query?.trim() && !f.type && !f.sender && !f.dateFrom && !f.dateTo) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(100)

      // Text search
      if (f.query?.trim()) {
        query = query.ilike('message_text', `%${f.query.trim()}%`)
      }

      // Type filter
      if (f.type === 'images') {
        query = query.not('image_url', 'is', null)
      } else if (f.type === 'videos') {
        query = query.eq('file_type', 'video')
      } else if (f.type === 'documents') {
        query = query.eq('file_type', 'document')
      } else if (f.type === 'voice') {
        query = query.eq('file_type', 'audio')
      } else if (f.type === 'links') {
        query = query.like('message_text', '%http%')
      }

      // Sender filter
      if (f.sender) {
        query = query.eq('sender_id', f.sender)
      }

      // Date range
      if (f.dateFrom) {
        query = query.gte('created_at', f.dateFrom)
      }
      if (f.dateTo) {
        query = query.lte('created_at', f.dateTo + 'T23:59:59')
      }

      // Group filter
      if (f.groupId) {
        // Search group messages instead
        let groupQuery = supabase
          .from('group_messages')
          .select('*')
          .eq('group_id', f.groupId)
          .order('created_at', { ascending: false })
          .limit(100)

        if (f.query?.trim()) {
          groupQuery = groupQuery.ilike('message_text', `%${f.query.trim()}%`)
        }
        if (f.type === 'images') {
          groupQuery = groupQuery.not('image_url', 'is', null)
        } else if (f.type === 'videos') {
          groupQuery = groupQuery.eq('file_type', 'video')
        } else if (f.type === 'documents') {
          groupQuery = groupQuery.eq('file_type', 'document')
        }

        const { data } = await groupQuery
        setResults(data || [])
        return
      }

      const { data } = await query
      setResults(data || [])
    } catch (err) {
      console.error('Search failed:', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [userId, filters])

  const updateFilters = useCallback((updates) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }, [])

  const clearSearch = useCallback(() => {
    setFilters({
      query: '',
      type: 'all',
      sender: null,
      dateFrom: null,
      dateTo: null,
      groupId: null,
    })
    setResults([])
  }, [])

  return {
    results,
    loading,
    filters,
    search,
    updateFilters,
    clearSearch,
  }
}
