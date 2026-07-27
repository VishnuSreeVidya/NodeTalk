import { useEffect, useRef } from 'react'

/**
 * Focus trap hook for modals and dialogs.
 * Traps keyboard focus within the container element.
 *
 * @param {boolean} active - Whether the trap is active
 * @returns {React.RefObject} Ref to attach to the container
 */
export default function useFocusTrap(active = true) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!active || !containerRef.current) return

    const container = containerRef.current
    const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

    const focusableElements = container.querySelectorAll(focusableSelectors)
    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    // Focus first element
    if (firstFocusable) {
      firstFocusable.focus()
    }

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable?.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [active])

  return containerRef
}
