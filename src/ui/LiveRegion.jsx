import { memo } from 'react'

/**
 * Accessible live region for screen reader announcements.
 * Use this to announce dynamic content changes.
 *
 * @param {Object} props
 * @param {string} props.message - The message to announce
 * @param {string} props.politeness - 'polite' or 'assertive'
 * @param {string} props.className - Additional classes
 */
function LiveRegion({ message, politeness = 'polite', className = '' }) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className={`sr-only ${className}`}
    >
      {message}
    </div>
  )
}

/**
 * Alert component for important announcements.
 */
function Alert({ children, variant = 'info', className = '' }) {
  const variants = {
    info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    success: 'bg-green-500/10 text-green-500 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-500 border-red-500/20',
  }

  return (
    <div
      role="alert"
      className={`rounded-xl border px-4 py-3 text-sm font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  )
}

const MemoizedLiveRegion = memo(LiveRegion)
const MemoizedAlert = memo(Alert)

export { MemoizedLiveRegion as LiveRegion, MemoizedAlert as Alert }
export default MemoizedLiveRegion
