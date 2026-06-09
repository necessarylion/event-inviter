import Guest from '#models/guest'
import type Invitation from '#models/invitation'
import invitationService from '#services/invitation_service'

/**
 * Trimmed, normalized self-registration payload (see publicRegisterValidator).
 */
export interface GuestRegistration {
  name: string
  email: string
  phone?: string | null
}

export type GuestRegistrationResult =
  | { ok: true; guest: Guest; invitation: Invitation }
  | { ok: false; reason: 'duplicate' }

/**
 * Shared "register a person as a confirmed guest" flow used by both the public
 * registration link (/r/:token) and public-event join (/e/:slug/join). Enforces
 * one registration per email per event and hands back the guest's personal
 * `link` invitation so the caller can land them on their invite page.
 */
class GuestRegistrationService {
  async register(eventId: number, payload: GuestRegistration): Promise<GuestRegistrationResult> {
    /**
     * One registration per email per event — block duplicates rather than
     * leaking another registrant's personal invite link.
     */
    const existing = await Guest.query()
      .where('eventId', eventId)
      .whereRaw('lower(email) = ?', [payload.email.toLowerCase()])
      .first()

    if (existing) {
      return { ok: false, reason: 'duplicate' }
    }

    const guest = await Guest.create({
      eventId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone ?? null,
      rsvpStatus: 'confirmed',
    })

    /**
     * Give the registrant their own personal invite (QR code + downloadable
     * card) to land on.
     */
    const invitation = await invitationService.forGuest(guest, 'link')

    return { ok: true, guest, invitation }
  }
}

export default new GuestRegistrationService()
