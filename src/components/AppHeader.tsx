import { Link, NavLink } from 'react-router'
import { useAuth } from '../hooks/useAuth'

export function AppHeader() {
  const { user } = useAuth()
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="brand">
          🧭 What to do?
        </Link>
        <nav className="site-nav">
          <NavLink to="/" end>
            Plan a day
          </NavLink>
          <NavLink to="/places">My places</NavLink>
          <NavLink to="/trips">My trips</NavLink>
          {user ? (
            <NavLink to="/account" className="nav-account">
              👤 {user.name.split(' ')[0]}
            </NavLink>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link to="/signup" className="btn btn-primary btn-small">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
