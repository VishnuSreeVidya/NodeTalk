import { useEffect, useRef } from 'react'

export function useClickOutside(handler, enabled = true) {
  const ref = useRef(null)

  useEffect(() => {
    if (!enabled) return

    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        handler()
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [handler, enabled])

  return ref
}
