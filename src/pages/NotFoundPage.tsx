import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <main className="narrow">
      <div className="status">
        <p>Page not found.</p>
        <Link to="/" className="btn btn-secondary">
          Back to planning
        </Link>
      </div>
    </main>
  )
}
