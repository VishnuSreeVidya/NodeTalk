import { describe, it, expect } from 'vitest'
import {
  generateKeyPair,
  deriveSharedKey,
  encryptFor,
  decryptMessage,
  getKeyPairFromStorage,
  storeKeyPair,
} from '../crypto'

function makeEncryption(privateKey, publicKeyJwk, peerPublicKeyJwk) {
  return { privateKey, publicKeyJwk, peerPublicKeyJwk }
}

describe('E2EE crypto round-trip', () => {
  it('encrypts and decrypts a received message using embedded sender key', async () => {
    const alice = await generateKeyPair()
    const bob = await generateKeyPair()

    const aliceEncryption = makeEncryption(alice.keyPair.privateKey, alice.publicKeyJwk, bob.publicKeyJwk)

    const ciphertext = await encryptFor(aliceEncryption, 'hello bob, this is secret')

    const bobDecryption = await decryptMessage(ciphertext, bob.keyPair.privateKey, {
      isOwn: false,
      fallbackPeerPublicKeyJwk: alice.publicKeyJwk,
    })

    expect(bobDecryption).toBe('hello bob, this is secret')
  })

  it('lets the sender decrypt its own message using the embedded receiver key', async () => {
    const alice = await generateKeyPair()
    const bob = await generateKeyPair()

    const aliceEncryption = makeEncryption(alice.keyPair.privateKey, alice.publicKeyJwk, bob.publicKeyJwk)

    const ciphertext = await encryptFor(aliceEncryption, 'secret from alice')

    const ownDecryption = await decryptMessage(ciphertext, alice.keyPair.privateKey, {
      isOwn: true,
      fallbackPeerPublicKeyJwk: bob.publicKeyJwk,
    })

    expect(ownDecryption).toBe('secret from alice')
  })

  it('survives the sender rotating their public key in user_keys', async () => {
    const alice = await generateKeyPair()
    const aliceNew = await generateKeyPair()
    const bob = await generateKeyPair()

    const aliceEncryption = makeEncryption(alice.keyPair.privateKey, alice.publicKeyJwk, bob.publicKeyJwk)

    const ciphertext = await encryptFor(aliceEncryption, 'still decrypts after rotation')

    // Bob now sees Alice's NEW public key in user_keys, but the message
    // embeds the key that was actually used.
    const bobDecryption = await decryptMessage(ciphertext, bob.keyPair.privateKey, {
      isOwn: false,
      fallbackPeerPublicKeyJwk: aliceNew.publicKeyJwk,
    })

    expect(bobDecryption).toBe('still decrypts after rotation')
  })

  it('decrypts legacy messages (no embedded keys) via fallback peer key', async () => {
    const alice = await generateKeyPair()
    const bob = await generateKeyPair()

    const sharedKey = await deriveSharedKey(alice.keyPair.privateKey, bob.publicKeyJwk)
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      sharedKey,
      new TextEncoder().encode('legacy message')
    )
    const b64 = (buffer) => {
      const bytes = new Uint8Array(buffer)
      let binary = ''
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
      return btoa(binary)
    }
    const legacyPayload = JSON.stringify({
      iv: b64(iv),
      data: b64(ciphertext),
    })

    const bobDecryption = await decryptMessage(legacyPayload, bob.keyPair.privateKey, {
      isOwn: false,
      fallbackPeerPublicKeyJwk: alice.publicKeyJwk,
    })

    expect(bobDecryption).toBe('legacy message')
  })

  it('returns [decryption failed] instead of throwing on wrong key', async () => {
    const alice = await generateKeyPair()
    const bob = await generateKeyPair()
    const mallory = await generateKeyPair()

    const aliceEncryption = makeEncryption(alice.keyPair.privateKey, alice.publicKeyJwk, bob.publicKeyJwk)

    const ciphertext = await encryptFor(aliceEncryption, 'do not read me')

    const wrongDecryption = await decryptMessage(ciphertext, mallory.keyPair.privateKey, {
      isOwn: false,
      fallbackPeerPublicKeyJwk: alice.publicKeyJwk,
    })

    expect(wrongDecryption).toBe('[decryption failed]')
  })

  it('round-trips non-ASCII text and emoji', async () => {
    const alice = await generateKeyPair()
    const bob = await generateKeyPair()

    const aliceEncryption = makeEncryption(alice.keyPair.privateKey, alice.publicKeyJwk, bob.publicKeyJwk)
    const ciphertext = await encryptFor(aliceEncryption, 'hola señor 🎉 你好')

    const bobDecryption = await decryptMessage(ciphertext, bob.keyPair.privateKey, {
      isOwn: false,
      fallbackPeerPublicKeyJwk: alice.publicKeyJwk,
    })

    expect(bobDecryption).toBe('hola señor 🎉 你好')
  })

  it('stores and reloads per-user keypairs from localStorage', async () => {
    localStorage.clear()

    const alice = await generateKeyPair()
    const bob = await generateKeyPair()

    await storeKeyPair('user-a', alice.keyPair, alice.publicKeyJwk)
    await storeKeyPair('user-b', bob.keyPair, bob.publicKeyJwk)

    const reloadedA = await getKeyPairFromStorage('user-a')
    const reloadedB = await getKeyPairFromStorage('user-b')

    expect(reloadedA.publicKeyJwk).toEqual(alice.publicKeyJwk)
    expect(reloadedB.publicKeyJwk).toEqual(bob.publicKeyJwk)
    expect(await getKeyPairFromStorage('user-c')).toBeNull()

    const ciphertext = await encryptFor(
      makeEncryption(reloadedA.privateKey, reloadedA.publicKeyJwk, reloadedB.publicKeyJwk),
      'persisted keys work'
    )
    const decrypted = await decryptMessage(ciphertext, reloadedB.privateKey, {
      isOwn: false,
      fallbackPeerPublicKeyJwk: reloadedA.publicKeyJwk,
    })
    expect(decrypted).toBe('persisted keys work')
  })
})
