import { MOCK_PARKING } from '../data/mockParking'
import type { Coordinates, JourneyMode, JourneyOption, ParkingOption } from '../types'
import { delay, hashString, relocate } from './mockBackend'

/**
 * MOCK JOURNEYS — getting to and from the area.
 * Real options: TransportAPI / National Rail Darwin / Realtime Trains for UK trains,
 * National Express / Megabus feeds for coaches, Google Routes for driving,
 * and JustPark / Parkopedia / NCP for bookable parking.
 */

const OPERATORS: Record<JourneyMode, string[]> = {
  train: ['Northern', 'TransPennine Express', 'Avanti West Coast', 'CrossCountry'],
  coach: ['National Express', 'Megabus'],
  car: ['Drive'],
}

interface JourneyQuery {
  from: string
  to: string
  date: string
  mode: JourneyMode
  /** Outbound options arrive before this (minutes since midnight). */
  arriveBy: number
  /** Return options leave after this. */
  departAfter: number
}

export async function getJourneyOptions(q: JourneyQuery): Promise<{ outbound: JourneyOption[]; return: JourneyOption[] }> {
  await delay(350)
  const seed = hashString(`${q.from.trim().toLowerCase()}|${q.to.toLowerCase()}`)
  const trainMins = 30 + (seed % 90)
  const duration = q.mode === 'train' ? trainMins : q.mode === 'coach' ? Math.round(trainMins * 1.5 + 15) : Math.round(trainMins * 0.9 + 5)
  const operators = OPERATORS[q.mode]
  const baseFare = q.mode === 'train' ? 8 + (seed % 30) : q.mode === 'coach' ? 4 + (seed % 12) : 0
  const fuel = Math.round(trainMins * 0.12 * 10) / 10

  const option = (direction: JourneyOption['direction'], depart: number, i: number): JourneyOption => {
    const changes = q.mode === 'car' ? 0 : (seed + i) % 3 === 0 ? 1 : 0
    const extra = changes * 12 + ((seed + i) % 3) * 4
    const peak = q.mode === 'train' && depart >= 6 * 60 + 30 && depart <= 9 * 60 + 30
    const adult = q.mode === 'car' ? 0 : Math.round(baseFare * (peak ? 1.4 : 1) * 100) / 100
    return {
      id: `${q.mode}-${direction}-${depart}`,
      mode: q.mode,
      direction,
      depart,
      arrive: depart + duration + extra,
      changes,
      operator: operators[(seed + i) % operators.length],
      pricePerAdult: adult,
      pricePerChild: Math.round(adult * 50) / 100,
      bookingUrl: q.mode === 'car' ? undefined : `https://example.com/book/${q.mode}?from=${encodeURIComponent(q.from)}&to=${encodeURIComponent(q.to)}&date=${q.date}`,
      note: q.mode === 'car' ? `~£${fuel} fuel each way` : peak ? 'Peak fare' : undefined,
    }
  }

  const outbound = [0, 1, 2].map((i) => {
    const arriveTarget = q.arriveBy - 10 - i * 30
    return option('outbound', arriveTarget - duration - (i === 1 ? 12 : 0), i)
  })
  const back = [0, 1, 2].map((i) => option('return', q.departAfter + 15 + i * 30 + (seed % 10), i))

  return { outbound: outbound.reverse(), return: back }
}

export async function getParking(origin: Coordinates): Promise<ParkingOption[]> {
  await delay(200)
  return relocate(MOCK_PARKING, origin).sort((a, b) => a.distanceKm - b.distanceKm)
}

export function parkingCost(p: ParkingOption, minutes: number): number {
  return Math.min(p.maxDayPrice, Math.ceil(minutes / 60) * p.pricePerHour)
}
