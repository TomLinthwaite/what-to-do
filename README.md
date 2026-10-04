# What to do?

A one-stop shop for days out. Just arrived somewhere new? Pick a location (or use your current one), tell it who's coming and what you fancy, and it'll help you find things to do and plan your day.

Currently runs entirely on **mock data and mock services** — no external APIs or backend are connected yet. Each mock is isolated behind a service function so it can be swapped for the real thing.

## Getting started

```bash
npm install
npm run dev
```

The service worker (offline mode) is only registered in production builds. To try it: `npm run build && npm run preview`.

## Features

- **Explore** — location + date, weather forecast, and settings for:
  - who's coming (solo/couple/friends/family, number of adults, kids by age group)
  - time window, transport mode, interests (incl. "What's on" events), per-activity budget, food requirements, distance
  - more options: accessibility (wheelchair, step-free/pram, baby changing), pace, total day budget, only show places that are open
- **Shortlist** places, then tick the ones you actually want to do.
- **Plan my day** — a timed itinerary with:
  - travel legs, waits for opening times / event start times, return-to-start option
  - start time, "finish by" deadline, per-stop visit length (+/−)
  - reorder, "Shortest route", auto "Add meal breaks"
  - warnings for closing times, late arrival, off-peak times and rain at outdoor stops
  - cost estimate for the group vs. day budget, booking links, nearby essentials (toilets, cash, pharmacy, charging, parking)
  - save to account, share link, add to calendar (.ics), open route in Google Maps
- **🎲 Surprise me** — builds a varied, ordered plan with meals from your settings.
- **Getting there & back** — train, coach or car from your home town: pick outbound/return journeys (which set your start and finish times) and bookable parking; fares are added to the day's cost and calendar export.
- **On the day** — when the trip is today, a live banner shows what's now and what's next with a countdown, plus optional "leave in 10 minutes" notifications.
- **My places** — ♡ favourite any place; mark places as visited with a 1–5 rating and private notes. Your ratings show on search results. Works logged out and merges into your account when you sign up / log in.
- **Accounts** — sign up / log in, saved trips (open, rename, duplicate, delete), profile with home town, default settings.
- **Offline** — installable PWA; the service worker caches the app so your plan, trips and places work without signal. An offline banner shows when the connection drops.
- **Shared plans** — `/shared#…` links show a read-only plan that can be copied into your own planner.

The trip you're working on is kept in `localStorage`, so it survives refreshes.

## Project structure

```
src/
  App.tsx                     Routes + providers
  types.ts                    Shared types (Preferences, Suggestion, Trip, User, ...)
  constants.ts                Options + defaults (time windows, transport, paces, interests, ...)
  context/                    AuthProvider (current user) and TripProvider (trip being planned)
  hooks/                      useAuth, useTrip, useLocalStorage
  pages/                      Explore, Shortlist, Plan, Trips, Account, Login, Signup, Shared, 404
  components/                 Header, steps, forms, cards, plan timeline, weather, essentials
  services/                   ⬅ swap these for real APIs
    suggestions.ts            Places + events search and filtering
    weather.ts                Forecast
    essentials.ts             Toilets, cash machines, parking, ...
    auth.ts                   Accounts (MOCK — not secure)
    trips.ts                  Saved trips (MOCK — localStorage)
    library.ts                Favourites, visits, ratings, notes (MOCK — localStorage)
    journeys.ts               Trains / coaches / driving + parking (MOCK)
    location.ts               Browser Geolocation
    mockBackend.ts            Helpers used only by the mocks
  utils/
    plan.ts                   Itinerary builder, route ordering, meal breaks, surprise me
    geo.ts / time.ts          Distance, travel estimates, time formatting
    share.ts / ics.ts         Share links and calendar export
    trip.ts / format.ts       Trip helpers and display formatting
  data/                       Mock places, events and essentials
```

## Connecting real services

| Mock | File | Suggested replacement |
|---|---|---|
| Places | `services/suggestions.ts` | Google Places API (New) + OpenStreetMap/Overpass for dietary tags |
| Events | `services/suggestions.ts` | Ticketmaster Discovery, Skiddle |
| Weather | `services/weather.ts` | Open-Meteo (free, no key) |
| Essentials | `services/essentials.ts` | Overpass (`amenity=toilets/atm/pharmacy/parking`) |
| Geocoding | `components/LocationPicker.tsx` (`TODO`) | Google Geocoding / Mapbox / Nominatim |
| Travel times | `utils/geo.ts` (`estimateTravelMins`) | Google Routes / Mapbox Directions / OpenRouteService |
| Auth | `services/auth.ts` | Supabase Auth, Firebase Auth, Clerk, Auth0 |
| Saved trips | `services/trips.ts` | A `trips` table/collection in your backend |
| Favourites & reviews | `services/library.ts` | A `place_entries` table keyed by user + place ID |
| Trains / coaches | `services/journeys.ts` | TransportAPI, National Rail Darwin, Realtime Trains; National Express / Megabus |
| Driving & parking | `services/journeys.ts` | Google Routes; JustPark / Parkopedia / NCP |
| Leave reminders | `hooks/useLeaveReminders.ts` | Web Push from a server so reminders arrive when the app is closed |
| Share links | `utils/share.ts` | Share a server-side trip ID instead of encoding the plan in the URL |

Keep the function signatures the same and the UI won't need to change. API keys should live on a server (or serverless functions), not in the browser.
