import vine from '@vinejs/vine'

/**
 * Accepted datetime formats: the value produced by an HTML `datetime-local`
 * input (no seconds / no offset) plus full ISO 8601 variants. Parsed by VineJS
 * (dayjs) and converted to a Luxon DateTime by the global transform
 * (see start/validator.ts).
 */
const dateFormats = [
  'YYYY-MM-DD[T]HH:mm',
  'YYYY-MM-DD[T]HH:mm:ss',
  'YYYY-MM-DD[T]HH:mm:ss.SSS',
  'YYYY-MM-DD[T]HH:mm:ssZ',
  'YYYY-MM-DD[T]HH:mm:ss.SSSZ',
  'YYYY-MM-DD',
]

/**
 * Shared event fields.
 */
const eventFields = {
  title: vine.string().trim().minLength(2).maxLength(150),
  description: vine.string().trim().maxLength(5000).nullable().optional(),
  location: vine.string().trim().maxLength(200).nullable().optional(),
  startsAt: vine.date({ formats: dateFormats }),
  endsAt: vine.date({ formats: dateFormats }).nullable().optional(),
  allowPublicRsvp: vine.boolean().optional(),
}

export const createEventValidator = vine.create({ ...eventFields })
export const updateEventValidator = vine.create({ ...eventFields })

/**
 * Per-event settings (the event settings page) — currently just the public
 * RSVP toggle.
 */
export const eventSettingsValidator = vine.create({
  allowPublicRsvp: vine.boolean(),
})
