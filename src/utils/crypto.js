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
