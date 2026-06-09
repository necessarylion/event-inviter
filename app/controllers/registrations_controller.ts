import env from '#start/env'
import RegistrationLink from '#models/registration_link'
import guestRegistrationService from '#services/guest_registration_service'
import registrationLinkService from '#services/registration_link_service'
import { formatEventWhen } from '#services/event_presenter_service'
import { publicRegisterValidator } from '#validators/registration'
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

    const result = await guestRegistrationService.register(link.eventId, payload)

    if (!result.ok) {
      session.flashAll()
      session.flash('error', 'This email is already registered for this event.')
      return response.redirect().back()
    }

    /**
     * Land the registrant on their own personal invite (QR code + downloadable
     * card).
     */
    return response.redirect().toRoute('invite.show', { token: result.invitation.token })
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
        when: formatEventWhen(event.startsAt, event.endsAt),
      },
    }
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
