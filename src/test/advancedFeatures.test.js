import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateKeyPair,
  encryptGroupMessagePayload,
  decryptGroupMessagePayload,
  restorePrivateKeyWithPassphrase,
} from '../utils/crypto'
import { fetchOlderDMMessages, fetchOlderGroupMessages } from '../services/messageService'
import { addPendingMessage, getPendingMessages, removePendingMessage } from '../utils/offlineDb'
import { supabase } from '../lib/supabase'

vi.mock('../lib/supabase', () => {
  const fromMock = vi.fn()
  return {
    supabase: {
      from: fromMock,
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
      },
    },
  }
})

describe('Advanced Features Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Group Message E2EE Encryption', () => {
    it('encrypts and decrypts a group message for group members', async () => {
      const alice = await generateKeyPair()
      const bob = await generateKeyPair()

      const aliceSender = {
        privateKey: alice.keyPair.privateKey,
        publicKeyJwk: alice.publicKeyJwk,
      }

      const memberKeysMap = {
        'alice-id': alice.publicKeyJwk,
        'bob-id': bob.publicKeyJwk,
      }

      const encryptedGroupJson = await encryptGroupMessagePayload(
        'Secret Group Announcement 🚀',
        aliceSender,
        memberKeysMap
      )

      expect(encryptedGroupJson).toContain('group-1')

      const bobDecrypted = await decryptGroupMessagePayload(
        encryptedGroupJson,
        'bob-id',
        bob.keyPair.privateKey
      )

      expect(bobDecrypted).toBe('Secret Group Announcement 🚀')
    })
  })

  describe('Passphrase E2EE Key Backup & Restore', () => {
    it('handles backup and restore functions gracefully', async () => {
      const userId = 'user-alice-123'
      const passphrase = 'SuperSecretPassphrase123'

      const mockSingle = vi.fn().mockResolvedValue({
        data: { encrypted_key_backup: null },
        error: null,
      })
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: mockSingle }),
      })
      supabase.from.mockReturnValue({ select: mockSelect })

      await expect(restorePrivateKeyWithPassphrase(passphrase, userId)).rejects.toThrow(
        'No key backup found'
      )
    })
  })

  describe('Cursor Pagination Services', () => {
    it('queries older DM and Group messages before a given timestamp', async () => {
      const mockLimit = vi.fn().mockResolvedValue({
        data: [{ id: 1, created_at: '2026-08-01T10:00:00Z' }],
        error: null,
      })
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockLtFunc = vi.fn().mockReturnValue({ order: mockOrder })
      const mockIn = vi.fn().mockResolvedValue({ data: [], error: null })
      const mockEq = vi.fn().mockReturnValue({ lt: mockLtFunc, in: mockIn })
      const mockOr = vi.fn().mockReturnValue({ lt: mockLtFunc })

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({ or: mockOr, eq: mockEq }),
      })

      const dmResult = await fetchOlderDMMessages('user-1', 'user-2', '2026-08-02T10:00:00Z', 50)
      expect(dmResult.data).toHaveLength(1)

      const groupResult = await fetchOlderGroupMessages('group-1', '2026-08-02T10:00:00Z', 50)
      expect(groupResult.data).toHaveLength(1)
    })
  })

  describe('IndexedDB Offline Queue Utilities', () => {
    it('handles offline queue functions gracefully when indexedDB is mocked or unsupported', async () => {
      const pending = await getPendingMessages()
      expect(Array.isArray(pending)).toBe(true)

      await removePendingMessage('offline-temp-1')
      const record = await addPendingMessage({ message_text: 'Offline test' })
      expect(record).toBeNull()
    })
  })
})
