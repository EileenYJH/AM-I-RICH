import { useCallback, useRef, useState } from 'react'

export function useLongPress(duration = 500) {
  const [active, setActive] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const start = useCallback(() => {
    timer.current = setTimeout(() => setActive(true), duration)
  }, [duration])

  const cancel = useCallback(() => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
  }, [])

  const dismiss = useCallback(() => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
    setActive(false)
  }, [])

  return { active, start, cancel, dismiss }
}
