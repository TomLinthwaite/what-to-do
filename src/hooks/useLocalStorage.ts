import { useEffect, useState } from 'react'

/** useState that survives page refreshes — handy when someone is using the app on the go. */
export function useLocalStorage<T>(key: string, initial: T | (() => T), parse: (value: T) => T = (v) => v) {
  const [value, setValue] = useState<T>(() => {
    const fallback = () => (initial instanceof Function ? initial() : initial)
    try {
      const raw = localStorage.getItem(key)
      return raw ? parse(JSON.parse(raw) as T) : fallback()
    } catch {
      return fallback()
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage full or unavailable (e.g. private mode) — keep working in memory.
    }
  }, [key, value])

  return [value, setValue] as const
}
