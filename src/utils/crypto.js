import { supabase } from '../supabaseClient'

const ALGO = { name: 'ECDH', namedCurve: 'P-256' }
const AES_ALGO = { name: 'AES-GCM', length: 256 }
const SALT = 'NodeTalk-E2EE-v1'
const KEY_STORAGE = 'nodetalk-e2ee-keypairs'

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

function encodeJwk(jwk) {
  return arrayBufferToBase64(new TextEncoder().encode(JSON.stringify(jwk)))
}

function decodeJwk(encoded) {
  return JSON.parse(new TextDecoder().decode(base64ToArrayBuffer(encoded)))
}

export async function generateKeyPair() {
  const keyPair = await crypto.subtle.generateKey(ALGO, true, ['deriveKey', 'deriveBits'])
  const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey)
  return { keyPair, publicKeyJwk }
}

export async function savePublicKey(publicKeyJwk) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const encoded = btoa(JSON.stringify(publicKeyJwk))

  const { error } = await supabase
    .from('user_keys')
    .upsert({ id: user.id, public_key: encoded }, { onConflict: 'id' })

  if (error) console.error('Failed to save public key:', error.message)
}

export async function fetchPublicKey(userId) {
  const { data, error } = await supabase
    .from('user_keys')
    .select('public_key')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return JSON.parse(atob(data.public_key))
}

export async function deriveSharedKey(privateKey, peerPublicKeyJwk) {
  const peerPublicKey = await crypto.subtle.importKey(
    'jwk',
    peerPublicKeyJwk,
    ALGO,
    false,
    []
  )

  const saltBuffer = new TextEncoder().encode(SALT)
  const sharedBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: peerPublicKey },
    privateKey,
    256
  )

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    sharedBits,
    { name: 'HKDF' },
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: saltBuffer, info: new TextEncoder().encode('encryption') },
    keyMaterial,
    AES_ALGO,
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypts a message and embeds the exact ECDH key pair used, so the
 * recipient can decrypt it with their own (stable) private key regardless of
 * how many times either side's public key in user_keys has been overwritten.
 */
export async function encryptMessage(text, sharedKey, senderPublicKeyJwk, receiverPublicKeyJwk) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(text)

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    sharedKey,
    encoded
  )

  return JSON.stringify({
    v: 2,
    iv: arrayBufferToBase64(iv),
    data: arrayBufferToBase64(ciphertext),
    senderKey: encodeJwk(senderPublicKeyJwk),
    receiverKey: encodeJwk(receiverPublicKeyJwk),
  })
}

/**
 * Derives the shared key from the local private key + the keys embedded in the
 * message, then decrypts. `isOwn` selects the receiver key (for messages this
 * client sent) or the sender key (for received messages). Legacy messages
 * without embedded keys fall back to the peer's current stored public key.
 */
export async function decryptMessage(encryptedJson, privateKey, { isOwn = false, fallbackPeerPublicKeyJwk = null } = {}) {
  try {
    const parsed = JSON.parse(encryptedJson)
    const { iv, data, senderKey, receiverKey } = parsed

    const embedded = isOwn ? receiverKey : senderKey
    const ecdhPeerJwk = embedded ? decodeJwk(embedded) : fallbackPeerPublicKeyJwk
    if (!ecdhPeerJwk) return 'Unable to decrypt message'

    const sharedKey = await deriveSharedKey(privateKey, ecdhPeerJwk)

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(base64ToArrayBuffer(iv)) },
      sharedKey,
      base64ToArrayBuffer(data)
    )

    return new TextDecoder().decode(decrypted)
  } catch (err) {
    console.error('Decryption failed safely:', err.message || 'Corrupted payload')
    return 'Unable to decrypt message'
  }
}

/**
 * Convenience wrapper: derives the conversation key and embeds both public keys.
 */
export async function encryptFor(encryption, text) {
  if (!encryption?.peerPublicKeyJwk) throw new Error('Peer public key missing')
  const sharedKey = await deriveSharedKey(encryption.privateKey, encryption.peerPublicKeyJwk)
  return encryptMessage(text, sharedKey, encryption.publicKeyJwk, encryption.peerPublicKeyJwk)
}

export async function getKeyPairFromStorage(userId) {
  const stored = localStorage.getItem(KEY_STORAGE)
  if (!stored) return null

  const all = JSON.parse(stored)
  const entry = all[userId]
  if (!entry) return null

  const privateKey = await crypto.subtle.importKey(
    'jwk',
    entry.privateKeyJwk,
    ALGO,
    false,
    ['deriveKey', 'deriveBits']
  )

  return { privateKey, publicKeyJwk: entry.publicKeyJwk }
}

export async function storeKeyPair(userId, keyPair, publicKeyJwk) {
  const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey)
  const stored = localStorage.getItem(KEY_STORAGE)
  const all = stored ? JSON.parse(stored) : {}
  all[userId] = { privateKeyJwk, publicKeyJwk }
  localStorage.setItem(KEY_STORAGE, JSON.stringify(all))
}

/**
 * Ensures the logged-in user has a stable per-user keypair (persisted in
 * localStorage, scoped by user id) and returns their private/public keys plus
 * the peer's current public key. The derived conversation key is computed per
 * message from the keys embedded in that message.
 */
export async function initEncryption(userId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let keys = await getKeyPairFromStorage(user.id)

  if (!keys) {
    const generated = await generateKeyPair()
    keys = { privateKey: generated.keyPair.privateKey, publicKeyJwk: generated.publicKeyJwk }
    await storeKeyPair(user.id, generated.keyPair, generated.publicKeyJwk)
    await savePublicKey(generated.publicKeyJwk)
  } else {
    // Re-assert the persisted public key so a tab/device that generated a
    // newer keypair (or a wiped user_keys row) can't orphan this identity key.
    await savePublicKey(keys.publicKeyJwk)
  }

  const peerPublicKeyJwk = await fetchPublicKey(userId)

  return { privateKey: keys.privateKey, publicKeyJwk: keys.publicKeyJwk, peerPublicKeyJwk: peerPublicKeyJwk || null }
}

/**
 * Encrypt user private key with passphrase for secure DB backup
 */
export async function backupPrivateKeyWithPassphrase(passphrase, userId) {
  let stored = localStorage.getItem(KEY_STORAGE)
  let all = JSON.parse(stored || '{}')
  let entry = all[userId]

  if (!entry?.privateKeyJwk) {
    const generated = await generateKeyPair()
    await storeKeyPair(userId, generated.keyPair, generated.publicKeyJwk)
    stored = localStorage.getItem(KEY_STORAGE)
    all = JSON.parse(stored || '{}')
    entry = all[userId]
  }

  const { privateKeyJwk, publicKeyJwk } = entry

  const enc = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100, hash: 'SHA-256' },
    keyMaterial,
    AES_ALGO,
    false,
    ['encrypt']
  )

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(JSON.stringify({ privateKeyJwk, publicKeyJwk }))
  )

  const payload = JSON.stringify({
    salt: arrayBufferToBase64(salt),
    iv: arrayBufferToBase64(iv),
    data: arrayBufferToBase64(ciphertext),
  })

  const { error } = await supabase
    .from('user_keys')
    .upsert(
      {
        id: userId,
        public_key: btoa(JSON.stringify(publicKeyJwk)),
        encrypted_key_backup: btoa(payload),
      },
      { onConflict: 'id' }
    )

  if (error) throw new Error('Failed to save key backup: ' + error.message)
  return true
}

/**
 * Restore user private key from DB using passphrase
 */
export async function restorePrivateKeyWithPassphrase(passphrase, userId) {
  const { data, error } = await supabase
    .from('user_keys')
    .select('encrypted_key_backup')
    .eq('id', userId)
    .single()

  if (error || !data?.encrypted_key_backup) throw new Error('No key backup found for account')

  const payload = JSON.parse(atob(data.encrypted_key_backup))
  const salt = new Uint8Array(base64ToArrayBuffer(payload.salt))
  const iv = new Uint8Array(base64ToArrayBuffer(payload.iv))
  const ciphertext = base64ToArrayBuffer(payload.data)

  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100, hash: 'SHA-256' },
    keyMaterial,
    AES_ALGO,
    false,
    ['decrypt']
  )

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )

  const { privateKeyJwk, publicKeyJwk } = JSON.parse(new TextDecoder().decode(decrypted))

  const privateKey = await crypto.subtle.importKey(
    'jwk',
    privateKeyJwk,
    ALGO,
    false,
    ['deriveKey', 'deriveBits']
  )

  await storeKeyPair(userId, { privateKey }, publicKeyJwk)
  await savePublicKey(publicKeyJwk)
  return { privateKey, publicKeyJwk }
}

/**
 * Encrypt a group message payload using pairwise recipient keys
 */
export async function encryptGroupMessagePayload(text, senderEncryption, memberKeysMap) {
  // memberKeysMap: { [userId]: publicKeyJwk }
  const symKey = await crypto.subtle.generateKey(AES_ALGO, true, ['encrypt', 'decrypt'])
  const exportedSymKey = await crypto.subtle.exportKey('jwk', symKey)
  const symKeyText = JSON.stringify(exportedSymKey)

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encodedText = new TextEncoder().encode(text)
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    symKey,
    encodedText
  )

  const encryptedSymKeys = {}
  for (const [memberId, peerJwk] of Object.entries(memberKeysMap)) {
    try {
      const sharedKey = await deriveSharedKey(senderEncryption.privateKey, peerJwk)
      const keyIv = crypto.getRandomValues(new Uint8Array(12))
      const encKeyData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: keyIv },
        sharedKey,
        new TextEncoder().encode(symKeyText)
      )
      encryptedSymKeys[memberId] = {
        iv: arrayBufferToBase64(keyIv),
        key: arrayBufferToBase64(encKeyData),
        senderJwk: encodeJwk(senderEncryption.publicKeyJwk),
      }
    } catch {
      // Ignore members with invalid keys
    }
  }

  return JSON.stringify({
    v: 'group-1',
    iv: arrayBufferToBase64(iv),
    data: arrayBufferToBase64(ciphertext),
    keys: encryptedSymKeys,
  })
}

/**
 * Decrypt a group message payload for a recipient
 */
export async function decryptGroupMessagePayload(encryptedGroupJson, userId, privateKey) {
  try {
    const parsed = JSON.parse(encryptedGroupJson)
    if (parsed.v !== 'group-1' || !parsed.keys?.[userId]) return 'Unable to decrypt message'

    const userKeyEntry = parsed.keys[userId]
    const senderJwk = decodeJwk(userKeyEntry.senderJwk)
    const sharedKey = await deriveSharedKey(privateKey, senderJwk)

    const decryptedSymKeyText = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(base64ToArrayBuffer(userKeyEntry.iv)) },
      sharedKey,
      base64ToArrayBuffer(userKeyEntry.key)
    )

    const symKeyJwk = JSON.parse(new TextDecoder().decode(decryptedSymKeyText))
    const symKey = await crypto.subtle.importKey('jwk', symKeyJwk, AES_ALGO, false, ['decrypt'])

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(base64ToArrayBuffer(parsed.iv)) },
      symKey,
      base64ToArrayBuffer(parsed.data)
    )

    return new TextDecoder().decode(decrypted)
  } catch (err) {
    console.error('Group message decryption failed safely:', err.message)
    return 'Unable to decrypt message'
  }
}
