import { useState, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'

/**
 * Hook for starring/unstarring messages
 */
export default function useStarMessages() {
  const [starredIds, setStarredIds] = useState(new Set())

  const toggleStar = useCallback(async (messageId, isGroup = false) => {
    const table = isGroup ? 'group_messages' : 'messages'
    const isStarred = starredIds.has(messageId)

    await supabase
      .from(table)
      .update({ is_starred: !isStarred })
      .eq('id', messageId)

    setStarredIds((prev) => {
      const next = new Set(prev)
      if (isStarred) next.delete(messageId)
      else next.add(messageId)
      return next
    })
  }, [starredIds])

  const isStarred = useCallback((messageId) => {
    return starredIds.has(messageId)
  }, [starredIds])

  return { toggleStar, isStarred }
}
