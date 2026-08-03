import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'

const THRESHOLD = 150 // Distance in px from bottom to be considered "at bottom"

/**
 * Custom hook for professional chat scrolling behavior
 * @param {Object} params
 * @param {React.RefObject<HTMLDivElement>} params.containerRef - Scrollable chat container ref
 * @param {Array} params.messages - Array of messages
 * @param {string} params.currentUserId - ID of logged in user
 * @param {boolean} params.loading - Initial loading state of conversation
 * @param {boolean} params.hasMore - Whether older messages can be loaded
 * @param {Function} params.onLoadOlder - Callback to load older messages
 * @param {string|number} params.chatId - Current conversation or group ID
 */
export function useChatScroll({
  containerRef,
  messages = [],
  currentUserId,
  loading = false,
  hasMore = false,
  onLoadOlder,
  chatId,
}) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const isNearBottomRef = useRef(true)
  const prevMessagesRef = useRef([])
  const prevChatIdRef = useRef(chatId)
  const prevScrollHeightRef = useRef(0)
  const isInitialLoadRef = useRef(true)
  const isPagingRef = useRef(false)

  // Scroll to bottom immediately or smoothly
  const scrollToBottom = useCallback(
    (behavior = 'smooth') => {
      const container = containerRef.current
      if (!container) return
      if (behavior === 'instant') {
        container.scrollTop = container.scrollHeight
      } else {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
      }
      isNearBottomRef.current = true
      setIsNearBottom(true)
      setShowScrollButton(false)
      setUnreadCount(0)
    },
    [containerRef]
  )

  // Handle Container Scroll Event
  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const distanceToBottom = scrollHeight - scrollTop - clientHeight
    const isAtBottom = distanceToBottom <= THRESHOLD

    isNearBottomRef.current = isAtBottom
    setIsNearBottom(isAtBottom)

    if (isAtBottom) {
      setShowScrollButton(false)
      setUnreadCount(0)
    } else {
      setShowScrollButton(true)
    }

    // Trigger pagination when reaching top
    if (scrollTop <= 20 && hasMore && !isPagingRef.current && onLoadOlder) {
      isPagingRef.current = true
      prevScrollHeightRef.current = scrollHeight
      onLoadOlder().finally(() => {
        isPagingRef.current = false
      })
    }
  }, [containerRef, hasMore, onLoadOlder])

  // Handle Chat Switch (Reset State & Instant Scroll)
  useEffect(() => {
    if (prevChatIdRef.current !== chatId) {
      prevChatIdRef.current = chatId
      isInitialLoadRef.current = true
      setUnreadCount(0)
      setShowScrollButton(false)
      isNearBottomRef.current = true
      setIsNearBottom(true)
    }
  }, [chatId])

  // Manage Message Changes (Initial Load, Own Message, Peer Message, Pagination)
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || loading) return

    const prevMessages = prevMessagesRef.current
    const prevLen = prevMessages.length
    const currLen = messages.length

    // Update prevMessagesRef
    prevMessagesRef.current = messages

    // 1. Initial Load for conversation
    if (isInitialLoadRef.current && currLen > 0) {
      isInitialLoadRef.current = false
      scrollToBottom('instant')
      prevScrollHeightRef.current = container.scrollHeight
      return
    }

    if (currLen === 0) return

    // 2. Pagination (Prepending older messages)
    if (currLen > prevLen && prevLen > 0) {
      const prevFirstId = prevMessages[0]?.id || prevMessages[0]?.tempId
      const currFirstId = messages[0]?.id || messages[0]?.tempId

      if (prevFirstId !== currFirstId) {
        const newScrollHeight = container.scrollHeight
        const heightDiff = newScrollHeight - prevScrollHeightRef.current
        if (heightDiff > 0) {
          container.scrollTop = container.scrollTop + heightDiff
        }
        prevScrollHeightRef.current = newScrollHeight
        return
      }
    }

    // 3. New Message Appended (Bottom)
    if (currLen > prevLen) {
      const latestMsg = messages[currLen - 1]
      const isOwnMsg = latestMsg.sender_id === currentUserId

      if (isOwnMsg) {
        scrollToBottom('smooth')
      } else if (isNearBottomRef.current) {
        scrollToBottom('smooth')
      } else {
        setUnreadCount((prev) => prev + 1)
        setShowScrollButton(true)
      }
      prevScrollHeightRef.current = container.scrollHeight
      return
    }

    // 4. Layout or state change while at bottom
    if (isNearBottomRef.current) {
      container.scrollTop = container.scrollHeight
    }

    prevScrollHeightRef.current = container.scrollHeight
  }, [messages, loading, currentUserId, containerRef, scrollToBottom])

  // Media Load Event Listener (Images & Videos)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMediaLoad = () => {
      if (isNearBottomRef.current) {
        container.scrollTop = container.scrollHeight
      }
    }

    container.addEventListener('load', handleMediaLoad, true)
    return () => {
      container.removeEventListener('load', handleMediaLoad, true)
    }
  }, [containerRef])

  return {
    handleScroll,
    scrollToBottom,
    showScrollButton,
    unreadCount,
    isNearBottom,
  }
}
