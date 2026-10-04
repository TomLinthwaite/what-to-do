import type { ParkingOption } from '../types'
import { at } from './mockHelpers'

export const MOCK_PARKING: Omit<ParkingOption, 'distanceKm'>[] = [
  { id: 'park1', name: 'NCP Market Street', coords: at(0.35, 0.3), pricePerHour: 4, maxDayPrice: 22, evCharging: false, bookingUrl: 'https://example.com/parking/ncp-market-street' },
  { id: 'park2', name: 'Q-Park Piccadilly', coords: at(-0.3, 0.9), pricePerHour: 3.5, maxDayPrice: 18, evCharging: true, bookingUrl: 'https://example.com/parking/qpark-piccadilly' },
  { id: 'park3', name: 'Private driveway (JustPark-style)', coords: at(1.1, -0.4), pricePerHour: 1.5, maxDayPrice: 9, evCharging: false, bookingUrl: 'https://example.com/parking/driveway-42' },
  { id: 'park4', name: 'Park & Ride (tram into centre)', coords: at(-3.5, -2.0), pricePerHour: 5, maxDayPrice: 5, evCharging: true, bookingUrl: 'https://example.com/parking/park-and-ride' },
]
