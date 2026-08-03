import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getConversationChannelId } from '../lib/utils'
import { decryptMessage, generateKeyPair } from '../utils/crypto'
import { markMessagesRead } from '../services/messageService'
import { supabase } from '../lib/supabase'

vi.mock('../lib/supabase', () => {
  const fromMock = vi.fn()
  return {
    supabase: {
      from: fromMock,
      channel: vi.fn(),
      removeChannel: vi.fn(),
    },
  }
})

describe('NodeTalk Reliability & Regression Audits', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Issue 1: Read Receipts', () => {
    it('markMessagesRead sends update for unread messages without restricting to delivered', async () => {
      const mockIn = vi.fn().mockReturnThis()
      const mockNeq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockResolvedValue({
        data: [
          { id: 1, message_status: 'read', read_at: '2026-08-03T20:00:00Z' },
        ],
        error: null,
      })
      const mockUpdate = vi.fn().mockReturnValue({
        in: mockIn,
        neq: mockNeq,
        select: mockSelect,
      })

      supabase.from.mockReturnValue({
        update: mockUpdate,
      })

      const res = await markMessagesRead([1, 2])

      expect(supabase.from).toHaveBeenCalledWith('messages')
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ message_status: 'read' })
      )
      expect(mockIn).toHaveBeenCalledWith('id', [1, 2])
      expect(mockNeq).toHaveBeenCalledWith('message_status', 'read')
      expect(res.data).toHaveLength(1)
    })
  })

  describe('Issue 2: Persistence on Refresh & Pagination', () => {
    it('generates deterministic conversation channel IDs regardless of user order', () => {
      const userA = 'uuid-1111-2222'
      const userB = 'uuid-9999-8888'

      const channel1 = getConversationChannelId(userA, userB)
      const channel2 = getConversationChannelId(userB, userA)

      expect(channel1).toBe(channel2)
      expect(channel1).toBe('uuid-1111-2222:uuid-9999-8888')
    })

    it('returns safe fallback "Unable to decrypt message" when decryption fails', async () => {
      const alice = await generateKeyPair()
      const corruptedPayload = JSON.stringify({
        iv: 'invalid-iv',
        data: 'invalid-data',
      })

      const result = await decryptMessage(corruptedPayload, alice.keyPair.privateKey, {
        isOwn: false,
        fallbackPeerPublicKeyJwk: alice.publicKeyJwk,
      })

      expect(result).toBe('Unable to decrypt message')
    })
  })
})
