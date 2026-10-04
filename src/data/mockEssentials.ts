import type { Essential } from '../types'
import { at } from './mockHelpers'

export const MOCK_ESSENTIALS: Omit<Essential, 'distanceKm'>[] = [
  { id: 'x1', type: 'toilets', name: 'Public toilets, Piccadilly Gardens', coords: at(0.1, 0.4), note: 'Free · accessible' },
  { id: 'x2', type: 'toilets', name: 'Arcade Shopping Centre toilets', coords: at(0.4, 0.15), note: 'Baby changing' },
  { id: 'x3', type: 'cash', name: 'Cash machine — High Street bank', coords: at(0.3, 0.2), note: 'Free withdrawals' },
  { id: 'x4', type: 'cash', name: 'Post Office', coords: at(-0.5, 0.3) },
  { id: 'x5', type: 'pharmacy', name: 'City Pharmacy', coords: at(-0.15, 0.1), note: 'Open until 22:00' },
  { id: 'x6', type: 'charging', name: 'Central Library', coords: at(-0.3, -0.25), note: 'Free charging points & Wi-Fi' },
  { id: 'x7', type: 'parking', name: 'NCP Market Street', coords: at(0.35, 0.3), note: '£4/hour' },
  { id: 'x8', type: 'parking', name: 'Park & Ride (tram)', coords: at(-3.5, -2.0), note: '£5 all day incl. tram' },
]
