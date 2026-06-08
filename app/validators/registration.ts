import vine from '@vinejs/vine'

/**
 * Accepted datetime formats — mirrors the event validator: the value produced
 * by an HTML `datetime-local` input plus full ISO 8601 variants. Parsed by
 * VineJS (dayjs) and converted to a Luxon DateTime by the global transform
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
 * Public self-registration submitted from the shareable link at /r/:token.
 * Email is required (and used to enforce one registration per person), phone
 * is optional. Empty optional strings are normalized to null by the controller.
 */
export const publicRegisterValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(150),
  email: vine.string().trim().email().maxLength(254),
  phone: vine.string().trim().maxLength(40).nullable().optional(),
})

/**
 * Owner-side create/regenerate of an event's registration link with an optional
 * expiry. `regenerate` forces a brand-new token (revoking the previous one).
 */
export const registrationLinkValidator = vine.create({
  expiresAt: vine.date({ formats: dateFormats }).nullable().optional(),
  isActive: vine.boolean().optional(),
  regenerate: vine.boolean().optional(),
})
