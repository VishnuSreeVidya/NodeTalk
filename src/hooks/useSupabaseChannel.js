import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Custom hook to manage a Supabase realtime channel with automatic cleanup.
 * @param {string} channelName - Name of the channel
 * @param {Object} options - Channel configuration
 * @param {Array} deps - Dependencies array for re-subscription
 */
export function useSupabaseChannel(channelName, options = {}, deps = []) {
  const channelRef = useRef(null)

  useEffect(() => {
    if (!channelName) return

    const channel = supabase.channel(channelName, options)
    channelRef.current = channel
    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [channelName, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps

  return channelRef
}

/**
 * Hook to broadcast typing indicators
 * @param {string} channelName - Channel to broadcast on
 * @param {Object} sender - { id, username }
 * @param {number} cooldown - Cooldown in ms (default 2000)
 */
export function useBroadcastTyping(channelName, sender, cooldown = 2000) {
  const isTypingRef = useRef(false)

  const broadcast = useCallback(() => {
    if (isTypingRef.current || !sender?.id) return
    isTypingRef.current = true

    const channel = supabase.channel(channelName)
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: { senderId: sender.id, senderName: sender.username },
        })
      }
    })

    setTimeout(() => {
      isTypingRef.current = false
      supabase.removeChannel(channel)
    }, cooldown)
  }, [channelName, sender, cooldown])

  return broadcast
}
