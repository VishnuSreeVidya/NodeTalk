const DB_NAME = 'nodetalk_offline_db'
const DB_VERSION = 1
const STORE_NAME = 'pending_messages'

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'))
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'tempId' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function addPendingMessage(payload) {
  try {
    const db = await openDb()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const tempId = 'offline-' + Date.now() + '-' + Math.random().toString(36).slice(2)
    const record = { ...payload, tempId, created_at: new Date().toISOString() }
    store.put(record)
    return record
  } catch (err) {
    console.error('Failed to queue offline message:', err)
    return null
  }
}

export async function getPendingMessages() {
  try {
    const db = await openDb()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    return new Promise((resolve) => {
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => resolve([])
    })
  } catch {
    return []
  }
}

export async function removePendingMessage(tempId) {
  try {
    const db = await openDb()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.delete(tempId)
  } catch (err) {
    console.error('Failed to remove pending message:', err)
  }
}
