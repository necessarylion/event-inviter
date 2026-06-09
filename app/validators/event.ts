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
 * Multipart form submissions (used when a thumbnail is attached) send empty
 * optional fields as empty strings rather than `null`. Normalise those back to
 * `null` before validation so date/string rules treat them as absent.
 */
const emptyToNull = (value: unknown) => (value === '' || value === undefined ? null : value)

/** Accepted thumbnail image: jpg/png/webp/gif up to 5MB. */
const thumbnailRule = vine
  .file({ size: '5mb', extnames: ['jpg', 'jpeg', 'png', 'webp', 'gif'] })
  .nullable()
  .optional()

/**
 * Shared event fields.
 */
const eventFields = {
  title: vine.string().trim().minLength(2).maxLength(150),
  description: vine.string().trim().maxLength(5000).parse(emptyToNull).nullable().optional(),
  location: vine.string().trim().maxLength(200).parse(emptyToNull).nullable().optional(),
  startsAt: vine.date({ formats: dateFormats }),
  endsAt: vine.date({ formats: dateFormats }).parse(emptyToNull).nullable().optional(),
  allowPublicRsvp: vine.boolean().optional(),
  thumbnail: thumbnailRule,
  mapUrl: vine
    .string()
    .trim()
    .url()
    .startsWith('https://maps.app.goo.gl')
    .maxLength(2048)
    .parse(emptyToNull)
    .nullable()
    .optional(),
}

export const createEventValidator = vine.create({ ...eventFields })
export const updateEventValidator = vine.create({
  ...eventFields,
  /** When true, the existing thumbnail is removed (no new file uploaded). */
  removeThumbnail: vine.boolean().optional(),
})

/**
 * Per-event settings (the event settings page): the public-RSVP toggle and the
 * "list this event publicly" toggle.
 */
export const eventSettingsValidator = vine.create({
  allowPublicRsvp: vine.boolean(),
  isPublic: vine.boolean().optional(),
})
