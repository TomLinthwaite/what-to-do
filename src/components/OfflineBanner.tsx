import { useOnline } from '../hooks/useOnline'

export function OfflineBanner() {
  const online = useOnline()
  if (online) return null
  return (
    <div className="offline-banner" role="status">
      📴 You're offline — your current plan, saved trips and places still work. Searching needs a connection.
    </div>
  )
}
