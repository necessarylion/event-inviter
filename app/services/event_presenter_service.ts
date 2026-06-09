import type { DateTime } from 'luxon'

const dateTimeFmt = 'cccc, dd LLLL yyyy • t'

/**
 * Human-readable date/time for an event, split into a primary line and an
 * optional second line. Shared by the invite, registration, and public-event
 * pages so they all render dates identically. Times are normalized to UTC.
 */
export function formatEventWhen(startsAt: DateTime | null, endsAt: DateTime | null) {
  if (!startsAt) return null

  const start = startsAt.setZone('UTC')

  if (!endsAt) return { start: start.toFormat(dateTimeFmt), end: null }

  const end = endsAt.setZone('UTC')
  if (start.hasSame(end, 'day')) {
    return { start: `${start.toFormat(dateTimeFmt)} – ${end.toFormat('t')}`, end: null }
  }
  return { start: `${start.toFormat(dateTimeFmt)} —`, end: end.toFormat(dateTimeFmt) }
}

/**
 * Resolve an "open in map" link for an event. Prefers an owner-supplied
 * `mapUrl`; otherwise builds a Google Maps search URL from the location text so
 * any event with a location is still mappable. Returns null when neither exists.
 */
export function resolveMapUrl(location: string | null, mapUrl: string | null) {
  if (mapUrl) return mapUrl
  if (!location) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
}
