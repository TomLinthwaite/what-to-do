import { MOCK_ESSENTIALS } from '../data/mockEssentials'
import type { Coordinates, Essential, TransportMode } from '../types'
import { delay, relocate } from './mockBackend'

/**
 * Toilets, cash machines, pharmacies, charging and parking near a point.
 * Swap for Overpass (OSM tags amenity=toilets / atm / pharmacy / parking) when ready.
 */
export async function getEssentials(origin: Coordinates, transport: TransportMode): Promise<Essential[]> {
  await delay(150)
  return relocate(MOCK_ESSENTIALS, origin)
    .filter((e) => e.type !== 'parking' || transport === 'driving')
    .sort((a, b) => a.distanceKm - b.distanceKm)
}
