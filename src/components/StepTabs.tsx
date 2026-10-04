import { NavLink } from 'react-router'
import { useTrip } from '../hooks/useTrip'

export function StepTabs() {
  const { trip, stops } = useTrip()
  const tabs = [
    { to: '/', label: '1. Explore', end: true },
    { to: '/shortlist', label: '2. Shortlist', count: trip.shortlist.length },
    { to: '/plan', label: '3. Plan my day', count: stops.length },
  ]

  return (
    <nav className="steps" aria-label="Steps">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `step ${isActive ? 'active' : ''}`}>
          {t.label}
          {t.count !== undefined && <span className="step-count">{t.count}</span>}
        </NavLink>
      ))}
    </nav>
  )
}
