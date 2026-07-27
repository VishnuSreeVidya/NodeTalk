/**
 * Input validation utilities for NodeTalk.
 * Prevents XSS and ensures data integrity.
 */

/** Maximum lengths */
const LIMITS = {
  USERNAME: 30,
  MESSAGE: 4000,
  STATUS: 100,
  GROUP_NAME: 50,
  EMAIL: 254,
}

/**
 * Sanitize text input to prevent XSS
 * @param {string} input
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return ''
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Validate email format
 * @param {string} email
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateEmail(email) {
  if (!email) return { valid: false, error: 'Email is required' }
  if (email.length > LIMITS.EMAIL) return { valid: false, error: 'Email is too long' }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(email)) return { valid: false, error: 'Invalid email format' }
  return { valid: true }
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePassword(password) {
  if (!password) return { valid: false, error: 'Password is required' }
  if (password.length < 6) return { valid: false, error: 'Password must be at least 6 characters' }
  if (password.length > 128) return { valid: false, error: 'Password is too long' }
  return { valid: true }
}

/**
 * Validate username
 * @param {string} username
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateUsername(username) {
  if (!username?.trim()) return { valid: false, error: 'Username is required' }
  if (username.trim().length < 2) return { valid: false, error: 'Username must be at least 2 characters' }
  if (username.trim().length > LIMITS.USERNAME) return { valid: false, error: `Username must be under ${LIMITS.USERNAME} characters` }
  if (!/^[a-zA-Z0-9_\s]+$/.test(username.trim())) return { valid: false, error: 'Username can only contain letters, numbers, spaces, and underscores' }
  return { valid: true }
}

/**
 * Validate message text
 * @param {string} text
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateMessage(text) {
  if (!text?.trim()) return { valid: false, error: 'Message cannot be empty' }
  if (text.length > LIMITS.MESSAGE) return { valid: false, error: `Message must be under ${LIMITS.MESSAGE} characters` }
  return { valid: true }
}

/**
 * Validate group name
 * @param {string} name
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateGroupName(name) {
  if (!name?.trim()) return { valid: false, error: 'Group name is required' }
  if (name.trim().length < 2) return { valid: false, error: 'Group name must be at least 2 characters' }
  if (name.trim().length > LIMITS.GROUP_NAME) return { valid: false, error: `Group name must be under ${LIMITS.GROUP_NAME} characters` }
  return { valid: true }
}

/**
 * Validate file upload
 * @param {File} file
 * @param {string[]} allowedTypes
 * @param {number} maxSize
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFileUpload(file, allowedTypes, maxSize) {
  if (!file) return { valid: false, error: 'No file selected' }
  if (!allowedTypes.includes(file.type) && !allowedTypes.some(t => file.type.startsWith(t.replace('/*', '/')))) {
    return { valid: false, error: 'File type not supported' }
  }
  if (file.size > maxSize) {
    return { valid: false, error: `File must be under ${Math.round(maxSize / 1024 / 1024)}MB` }
  }
  return { valid: true }
}

export { LIMITS }
