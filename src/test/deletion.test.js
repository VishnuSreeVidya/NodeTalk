import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  deleteDMMessage,
  deleteGroupMessage,
  fetchDMMessages,
  fetchGroupMessages,
} from '../services/messageService'
import { supabase } from '../lib/supabase'

vi.mock('../lib/supabase', () => {
  return {
    supabase: {
      from: vi.fn(),
    },
  }
})

describe('Delete for Me & Delete for Everyone Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates deleted_for_all when Delete for Everyone is called for DM message', async () => {
    const mockUpdate = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockReturnThis()
    const mockSelect = vi.fn().mockResolvedValue({ data: [{ id: 'msg-1', deleted_for_all: true }], error: null })

    supabase.from.mockReturnValue({
      update: mockUpdate,
      eq: mockEq,
      select: mockSelect,
    })

    const result = await deleteDMMessage('msg-1', 'everyone', 'user-a')

    expect(supabase.from).toHaveBeenCalledWith('messages')
    expect(mockUpdate).toHaveBeenCalledWith({ deleted_for_all: true })
    expect(mockEq).toHaveBeenCalledWith('id', 'msg-1')
    expect(result.data).toEqual([{ id: 'msg-1', deleted_for_all: true }])
  })

  it('inserts into message_deletions when Delete for Me is called for DM message', async () => {
    const mockUpsert = vi.fn().mockReturnThis()
    const mockSelect = vi.fn().mockResolvedValue({ data: [{ message_id: 'msg-1', user_id: 'user-a' }], error: null })

    supabase.from.mockReturnValue({
      upsert: mockUpsert,
      select: mockSelect,
    })

    const result = await deleteDMMessage('msg-1', 'self', 'user-a')

    expect(supabase.from).toHaveBeenCalledWith('message_deletions')
    expect(mockUpsert).toHaveBeenCalledWith(
      { message_id: 'msg-1', user_id: 'user-a' },
      { onConflict: 'message_id,user_id' }
    )
    expect(result.data).toEqual([{ message_id: 'msg-1', user_id: 'user-a' }])
  })

  it('filters out messages present in message_deletions during fetchDMMessages', async () => {
    const mockMessages = [
      { id: 'msg-1', sender_id: 'user-a', receiver_id: 'user-b', message_text: 'Msg 1', created_at: '2026-08-03T10:00:00Z' },
      { id: 'msg-2', sender_id: 'user-b', receiver_id: 'user-a', message_text: 'Msg 2', created_at: '2026-08-03T10:01:00Z' },
    ]

    const mockDeletions = [{ message_id: 'msg-1' }]

    supabase.from.mockImplementation((table) => {
      if (table === 'messages') {
        return {
          select: vi.fn().mockReturnThis(),
          or: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({ data: mockMessages, error: null }),
        }
      }
      if (table === 'message_deletions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: mockDeletions, error: null }),
        }
      }
      return {}
    })

    const result = await fetchDMMessages('user-a', 'user-b', 50)

    // msg-1 deleted for user-a, only msg-2 should be returned
    expect(result.data).toHaveLength(1)
    expect(result.data[0].id).toBe('msg-2')
  })

  it('updates group_messages when Delete for Everyone is called for group message', async () => {
    const mockUpdate = vi.fn().mockReturnThis()
    const mockEq = vi.fn().mockReturnThis()
    const mockSelect = vi.fn().mockResolvedValue({ data: [{ id: 'gmsg-1', deleted_for_all: true }], error: null })

    supabase.from.mockReturnValue({
      update: mockUpdate,
      eq: mockEq,
      select: mockSelect,
    })

    const result = await deleteGroupMessage('gmsg-1', 'everyone', 'user-a')

    expect(supabase.from).toHaveBeenCalledWith('group_messages')
    expect(mockUpdate).toHaveBeenCalledWith({ deleted_for_all: true })
    expect(mockEq).toHaveBeenCalledWith('id', 'gmsg-1')
    expect(result.data).toEqual([{ id: 'gmsg-1', deleted_for_all: true }])
  })

  it('filters out group messages present in group_message_deletions during fetchGroupMessages', async () => {
    const mockGroupMessages = [
      { id: 'gm-1', group_id: 'grp-1', sender_id: 'user-a', message_text: 'Group 1', created_at: '2026-08-03T10:00:00Z' },
      { id: 'gm-2', group_id: 'grp-1', sender_id: 'user-b', message_text: 'Group 2', created_at: '2026-08-03T10:01:00Z' },
    ]

    const mockDeletions = [{ group_message_id: 'gm-1' }]

    supabase.from.mockImplementation((table) => {
      if (table === 'group_messages') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({ data: mockGroupMessages, error: null }),
        }
      }
      if (table === 'group_message_deletions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: mockDeletions, error: null }),
        }
      }
      return {}
    })

    const result = await fetchGroupMessages('grp-1', 'user-a', 50)

    expect(result.data).toHaveLength(1)
    expect(result.data[0].id).toBe('gm-2')
  })
})
