import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'

export function RequireAuth() {
  const { user, loading, signedOut } = useAuth()
  const location = useLocation()
  if (loading) return <p className="status">Loading…</p>
  if (!user && signedOut) return <Navigate to="/" replace />
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  return <Outlet />
}
