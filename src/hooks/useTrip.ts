import { useContext } from 'react'
import { TripContext } from '../context/TripContext'

export function useTrip() {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTrip must be used inside <TripProvider>')
  return ctx
}
