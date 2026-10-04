import { useEffect, useState } from 'react'
import { ESSENTIAL_TYPES } from '../constants'
import { getEssentials } from '../services/essentials'
import type { Coordinates, Essential, TransportMode } from '../types'

export function EssentialsPanel({ origin, transport }: { origin: Coordinates; transport: TransportMode }) {
  const [essentials, setEssentials] = useState<Essential[] | null>(null)

  useEffect(() => {
    let cancelled = false
    getEssentials(origin, transport).then((e) => !cancelled && setEssentials(e))
    return () => {
      cancelled = true
    }
  }, [origin, transport])

  if (!essentials) return null

  const nearestByType = ESSENTIAL_TYPES.map((t) => ({ type: t, item: essentials.find((e) => e.type === t.value) })).filter(
    (x): x is { type: (typeof ESSENTIAL_TYPES)[number]; item: Essential } => x.item !== undefined,
  )

  return (
    <section className="panel">
      <h2 className="section-title">Essentials nearby</h2>
      <ul className="essentials">
        {nearestByType.map(({ type, item }) => (
          <li key={type.value}>
            <span className="essentials-emoji" aria-hidden="true">
              {type.emoji}
            </span>
            <span className="essentials-body">
              <strong>{type.label}</strong>
              <span className="shortlist-meta">
                {item.name} · {item.distanceKm} km{item.note ? ` · ${item.note}` : ''}
              </span>
            </span>
            <a
              className="link"
              href={`https://www.google.com/maps/search/?api=1&query=${item.coords.lat},${item.coords.lng}`}
              target="_blank"
              rel="noreferrer"
            >
              Map
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
