import { useState, useEffect, useRef } from 'react'

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const timerRef = useRef(null)

  useEffect(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => clearTimeout(timerRef.current)
  }, [value, delay])

  return debouncedValue
}
