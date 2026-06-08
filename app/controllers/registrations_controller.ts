import env from '#start/env'
import Guest from '#models/guest'
import RegistrationLink from '#models/registration_link'
import invitationService from '#services/invitation_service'
import registrationLinkService from '#services/registration_link_service'
import { publicRegisterValidator } from '#validators/registration'
import type { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Public, server-rendered (Edge) self-registration page reached via an event's
 * shareable link at /r/:token. Anyone with the link can register as a guest;
 * on success they're sent to their own personal invite page (/i/:token).
 */
export default class RegistrationsController {
  async show({ params, view, response }: HttpContext) {
    const link = await this.loadLink(params.token)
    if (!link) {
      response.status(404)
      return view.render('invite/not_found')
    }

    return view.render('register/show', this.viewProps(link))
  }

  async register({ params, request, response, session, view }: HttpContext) {
    const link = await this.loadLink(params.token)
    if (!link) {
      response.status(404)
      return view.render('invite/not_found')
    }

    if (!link.isUsable) {
      session.flash('error', 'Registration is closed for this event.')
      return response.redirect().back()
    }

    const payload = await publicRegisterValidator.validate(
      normalizeRegistration(request.only(['name', 'email', 'phone']))
    )

    /**
     * One registration per email per event — block duplicates rather than
     * leaking another registrant's personal invite link.
     */
    const existing = await Guest.query()
      .where('eventId', link.eventId)
      .whereRaw('lower(email) = ?', [payload.email.toLowerCase()])
      .first()

    if (existing) {
      session.flashAll()
      session.flash('error', 'This email is already registered for this event.')
      return response.redirect().back()
    }

    const guest = await Guest.create({
      eventId: link.eventId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone ?? null,
      rsvpStatus: 'confirmed',
    })

    /**
     * Give the registrant their own personal invite (QR code + downloadable
     * card) and land them on it.
     */
    const invitation = await invitationService.forGuest(guest, 'link')
    return response.redirect().toRoute('invite.show', { token: invitation.token })
  }

  private viewProps(link: RegistrationLink) {
    const { event } = link
    return {
      appUrl: env.get('APP_URL'),
      token: link.token,
      registrationUrl: registrationLinkService.registrationUrl(link.token),
      isOpen: link.isUsable,
      isExpired: link.isExpired,
      event: {
        title: event.title,
        description: event.description,
        location: event.location,
        when: this.formatWhen(event.startsAt, event.endsAt),
      },
    }
  }

  /**
   * Human-readable date/time, split into a primary line and an optional second
   * line — same formatting as the invitation page (see InviteController).
   */
  private formatWhen(startsAt: DateTime | null, endsAt: DateTime | null) {
    if (!startsAt) return null

    const start = startsAt.setZone('UTC')
    const dateTimeFmt = 'cccc, dd LLLL yyyy • t'

    if (!endsAt) return { start: start.toFormat(dateTimeFmt), end: null }

    const end = endsAt.setZone('UTC')
    if (start.hasSame(end, 'day')) {
      return { start: `${start.toFormat(dateTimeFmt)} – ${end.toFormat('t')}`, end: null }
    }
    return { start: `${start.toFormat(dateTimeFmt)} —`, end: end.toFormat(dateTimeFmt) }
  }

  private loadLink(token: string) {
    return RegistrationLink.query().where('token', token).preload('event').first()
  }
}

/**
 * Trims strings and converts an empty optional phone to null.
 */
function normalizeRegistration(row: Record<string, unknown>) {
  const phone = typeof row.phone === 'string' ? row.phone.trim() : row.phone
  return {
    name: typeof row.name === 'string' ? row.name.trim() : row.name,
    email: typeof row.email === 'string' ? row.email.trim() : row.email,
    phone: phone === '' || phone === undefined ? null : phone,
  }
}
