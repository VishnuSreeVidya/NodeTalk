import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useChatScroll } from '../hooks/useChatScroll'

describe('useChatScroll Hook Behavior Test Suite', () => {
  let mockContainer

  beforeEach(() => {
    mockContainer = {
      scrollTop: 0,
      scrollHeight: 1000,
      clientHeight: 500,
      scrollTo: vi.fn(({ top }) => {
        mockContainer.scrollTop = top
      }),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
  })

  it('performs instant scroll to bottom on initial message load', () => {
    const containerRef = { current: mockContainer }
    const messages = [
      { id: '1', sender_id: 'user-a', message_text: 'Hello' },
      { id: '2', sender_id: 'user-b', message_text: 'World' },
    ]

    renderHook(() =>
      useChatScroll({
        containerRef,
        messages,
        currentUserId: 'user-a',
        loading: false,
        chatId: 'chat-1',
      })
    )

    // Initial load should set scrollTop to scrollHeight (1000)
    expect(mockContainer.scrollTop).toBe(1000)
  })

  it('auto-scrolls when user sends their own message', () => {
    const containerRef = { current: mockContainer }
    const initialMessages = [{ id: '1', sender_id: 'user-a', message_text: 'Hi' }]

    const { rerender } = renderHook(
      ({ msgs }) =>
        useChatScroll({
          containerRef,
          messages: msgs,
          currentUserId: 'user-a',
          loading: false,
          chatId: 'chat-1',
        }),
      { initialProps: { msgs: initialMessages } }
    )

    // User sends message
    const updatedMessages = [
      ...initialMessages,
      { id: '2', sender_id: 'user-a', message_text: 'Sending a message' },
    ]

    mockContainer.scrollHeight = 1200
    rerender({ msgs: updatedMessages })

    expect(mockContainer.scrollTo).toHaveBeenCalledWith({ top: 1200, behavior: 'smooth' })
  })

  it('increments unread count and keeps scroll position when peer sends message while user is scrolled up', () => {
    const containerRef = { current: mockContainer }
    const initialMessages = [
      { id: '1', sender_id: 'user-b', message_text: 'Message 1' },
      { id: '2', sender_id: 'user-b', message_text: 'Message 2' },
    ]

    const { result, rerender } = renderHook(
      ({ msgs }) =>
        useChatScroll({
          containerRef,
          messages: msgs,
          currentUserId: 'user-a',
          loading: false,
          chatId: 'chat-1',
        }),
      { initialProps: { msgs: initialMessages } }
    )

    // User scrolls up (scrollTop = 100, distanceToBottom = 1000 - 100 - 500 = 400 > 150)
    mockContainer.scrollTop = 100
    act(() => {
      result.current.handleScroll()
    })

    expect(result.current.showScrollButton).toBe(true)

    // Peer sends new message
    const updatedMessages = [
      ...initialMessages,
      { id: '3', sender_id: 'user-b', message_text: 'Message 3 from peer' },
    ]
    mockContainer.scrollHeight = 1300

    rerender({ msgs: updatedMessages })

    // Should NOT scroll down to bottom, should show 1 unread message
    expect(result.current.unreadCount).toBe(1)
    expect(result.current.showScrollButton).toBe(true)
  })

  it('preserves scroll position when older messages are prepended (pagination)', () => {
    const containerRef = { current: mockContainer }
    const initialMessages = [
      { id: '50', sender_id: 'user-b', message_text: 'Message 50' },
      { id: '51', sender_id: 'user-b', message_text: 'Message 51' },
    ]

    const { rerender } = renderHook(
      ({ msgs }) =>
        useChatScroll({
          containerRef,
          messages: msgs,
          currentUserId: 'user-a',
          loading: false,
          chatId: 'chat-1',
        }),
      { initialProps: { msgs: initialMessages } }
    )

    // User at top (scrollTop = 0)
    mockContainer.scrollTop = 0
    mockContainer.scrollHeight = 1000

    // Prepended older messages 1-49
    const olderMessages = [
      { id: '1', sender_id: 'user-b', message_text: 'Message 1' },
      ...initialMessages,
    ]

    mockContainer.scrollHeight = 1800 // Added 800px of content at top
    rerender({ msgs: olderMessages })

    // scrollTop should be adjusted by 800px (1800 - 1000) so user stays at same relative position
    expect(mockContainer.scrollTop).toBe(800)
  })
})
