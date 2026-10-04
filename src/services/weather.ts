import type { Coordinates, Forecast, SlotForecast, WeatherCondition } from '../types'
import { delay, hashString } from './mockBackend'

const CONDITIONS: WeatherCondition[] = ['sunny', 'cloudy', 'cloudy', 'showers', 'rain', 'sunny']

/**
 * Mock forecast that's stable for a given place and date.
 * Swap for Open-Meteo (free, no key): https://open-meteo.com/en/docs
 */
export async function getForecast(coords: Coordinates, date: string): Promise<Forecast> {
  await delay(150)
  const seed = hashString(`${coords.lat.toFixed(2)},${coords.lng.toFixed(2)},${date}`)
  const slot = (offset: number, baseTemp: number): SlotForecast => {
    const condition = CONDITIONS[(seed + offset) % CONDITIONS.length]
    const rainChance = { sunny: 5, cloudy: 20, showers: 55, rain: 85 }[condition]
    return { condition, tempC: baseTemp + (seed % 5), rainChance }
  }
  return { date, slots: { morning: slot(0, 11), afternoon: slot(1, 15), evening: slot(3, 10) } }
}
