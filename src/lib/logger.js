/**
 * Lightweight logging utility for NodeTalk.
 * In production, only errors are logged. In development, all levels are available.
 */
const isDev = import.meta.env.DEV

const log = {
  /** Log informational messages (dev only) */
  info: (...args) => {
    if (isDev) console.log('[NodeTalk]', ...args)
  },
  /** Log warnings (dev only) */
  warn: (...args) => {
    if (isDev) console.warn('[NodeTalk]', ...args)
  },
  /** Log errors (always) */
  error: (...args) => {
    console.error('[NodeTalk]', ...args)
  },
  /** Log debug messages (dev only) */
  debug: (...args) => {
    if (isDev) console.debug('[NodeTalk]', ...args)
  },
  /** Log performance metrics (dev only) */
  perf: (label, fn) => {
    if (!isDev) return fn()
    const start = performance.now()
    const result = fn()
    const duration = performance.now() - start
    console.log(`[NodeTalk] ${label}: ${duration.toFixed(2)}ms`)
    return result
  },
  /** Log async performance metrics */
  perfAsync: async (label, fn) => {
    if (!isDev) return fn()
    const start = performance.now()
    const result = await fn()
    const duration = performance.now() - start
    console.log(`[NodeTalk] ${label}: ${duration.toFixed(2)}ms`)
    return result
  },
}

export default log
