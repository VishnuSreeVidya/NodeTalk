/**
 * Environment variable validation for NodeTalk.
 * Ensures required env vars are present at startup.
 */

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
]

/**
 * Validate that all required environment variables are set.
 * Logs warnings in development, throws in production.
 */
export function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !import.meta.env[key])

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`
    if (import.meta.env.PROD) {
      throw new Error(message)
    } else {
      console.warn(`[NodeTalk] ${message}`)
    }
  }
}

/**
 * Get a validated environment variable
 * @param {string} key
 * @param {string} fallback
 * @returns {string}
 */
export function getEnv(key, fallback = '') {
  return import.meta.env[key] || fallback
}

/**
 * App configuration derived from environment
 */
export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
}
