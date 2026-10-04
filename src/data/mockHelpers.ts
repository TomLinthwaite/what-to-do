import { DEFAULT_CENTER } from '../constants'
import type { Coordinates, OpeningHours } from '../types'

/** Places a point `northKm` / `eastKm` away from DEFAULT_CENTER. */
export function at(northKm: number, eastKm: number): Coordinates {
  return {
    lat: DEFAULT_CENTER.lat + northKm / 111.32,
    lng: DEFAULT_CENTER.lng + eastKm / (111.32 * Math.cos((DEFAULT_CENTER.lat * Math.PI) / 180)),
  }
}

export function hours(open: number, close: number): OpeningHours {
  return { open: open * 60, close: close * 60 }
}
