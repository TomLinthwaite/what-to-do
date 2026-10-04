import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useTrip } from '../hooks/useTrip'
import { describePreferences } from '../utils/format'

export function AccountPage() {
  const { user, updateUser, logOut, deleteAccount } = useAuth()
  const { trip, setPreferences } = useTrip()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [home, setHome] = useState(user?.home ?? '')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!user) return null

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await updateUser({ name: name.trim(), email, home: home.trim() || undefined })
      setMessage('Profile updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update profile.')
    }
  }

  async function saveDefaults() {
    await updateUser({ defaultPreferences: trip.preferences })
    setMessage('Current planner settings saved as your defaults.')
  }

  async function clearDefaults() {
    await updateUser({ defaultPreferences: undefined })
    setMessage('Default settings cleared.')
  }

  function applyDefaults() {
    if (!user?.defaultPreferences) return
    setPreferences(user.defaultPreferences)
    navigate('/')
  }

  // RequireAuth sends signed-out users home, so no navigation is needed here.
  async function handleLogOut() {
    await logOut()
  }

  async function handleDelete() {
    if (!window.confirm('Delete your account and all saved trips? This cannot be undone.')) return
    await deleteAccount()
  }

  return (
    <main className="narrow stack">
      <h1>Your account</h1>
      {message && <p className="notice">{message}</p>}

      <form className="panel" onSubmit={saveProfile}>
        <h2>Profile</h2>
        <label className="field">
          Name
          <input required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          Home town or station
          <input value={home} onChange={(e) => setHome(e.target.value)} placeholder="e.g. Leeds" />
          <small className="muted">Used to suggest trains, coaches and driving routes to your days out.</small>
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn-primary">
          Save profile
        </button>
      </form>

      <section className="panel">
        <h2>Default settings</h2>
        <p className="hint">Used automatically when you start a new trip or log in.</p>
        {user.defaultPreferences ? (
          <ul className="summary-list">
            {describePreferences(user.defaultPreferences).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : (
          <p className="muted">No defaults saved yet.</p>
        )}
        <div className="button-row">
          <button type="button" className="btn btn-secondary" onClick={saveDefaults}>
            Use current planner settings
          </button>
          {user.defaultPreferences && (
            <>
              <button type="button" className="btn btn-secondary" onClick={applyDefaults}>
                Apply to current trip
              </button>
              <button type="button" className="link" onClick={clearDefaults}>
                Clear defaults
              </button>
            </>
          )}
        </div>
      </section>

      <section className="panel">
        <h2>Session</h2>
        <div className="button-row">
          <button type="button" className="btn btn-secondary" onClick={handleLogOut}>
            Log out
          </button>
          <button type="button" className="btn btn-danger" onClick={handleDelete}>
            Delete account
          </button>
        </div>
        <p className="hint">Accounts are currently stored in this browser only (mock auth).</p>
      </section>
    </main>
  )
}
