import { supabase } from '../supabaseClient'

const ALGO = { name: 'ECDH', namedCurve: 'P-256' }
const AES_ALGO = { name: 'AES-GCM', length: 256 }
const SALT = 'NodeTalk-E2EE-v1'

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

export async function encryptMessage(text, sharedKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(text)

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    sharedKey,
    encoded
  )

  return JSON.stringify({
    iv: arrayBufferToBase64(iv),
    data: arrayBufferToBase64(ciphertext),
  })
}

export async function decryptMessage(encryptedJson, sharedKey) {
  try {
    const { iv, data } = JSON.parse(encryptedJson)
    const ivBuffer = base64ToArrayBuffer(iv)
    const dataBuffer = base64ToArrayBuffer(data)

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(ivBuffer) },
      sharedKey,
      dataBuffer
    )

    return new TextDecoder().decode(decrypted)
  } catch {
    return '[decryption failed]'
  }
}

export async function getKeyPairFromStorage() {
  const stored = sessionStorage.getItem('nodetalk-e2ee-keypair')
  if (!stored) return null

  const { privateKeyJwk, publicKeyJwk } = JSON.parse(stored)

  const privateKey = await crypto.subtle.importKey(
    'jwk',
    privateKeyJwk,
    ALGO,
    false,
    ['deriveKey', 'deriveBits']
  )

  return { privateKey, publicKeyJwk }
}

export async function storeKeyPair(keyPair, publicKeyJwk) {
  const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey)
  sessionStorage.setItem(
    'nodetalk-e2ee-keypair',
    JSON.stringify({ privateKeyJwk, publicKeyJwk })
  )
}

export async function initEncryption(userId) {
  let keys = await getKeyPairFromStorage()

  if (!keys) {
    const generated = await generateKeyPair()
    keys = { privateKey: generated.keyPair.privateKey, publicKeyJwk: generated.publicKeyJwk }
    await storeKeyPair(generated.keyPair, generated.publicKeyJwk)
    await savePublicKey(generated.publicKeyJwk)
  }

  const peerPubKey = await fetchPublicKey(userId)
  if (!peerPubKey) return null

  const sharedKey = await deriveSharedKey(keys.privateKey, peerPubKey)
  return sharedKey
}
