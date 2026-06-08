import Event from '#models/event'
import RegistrationLink from '#models/registration_link'
import registrationLinkService from '#services/registration_link_service'
import { registrationLinkValidator } from '#validators/registration'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Owner-side management of an event's single public registration link
 * (create, set expiry, enable/disable, regenerate). The public-facing
 * counterpart is RegistrationsController.
 */
export default class RegistrationLinksController {
  /**
   * Create the event's registration link, or update it (expiry / active state /
   * regenerate the token). One link per event, so this upserts.
   */
  async store({ params, request, auth, response, session }: HttpContext) {
    const event = await this.findOwnedEvent(auth.user!.id, params.eventId)
    if (!event) {
      return response.notFound('Event not found')
    }

    const { expiresAt, isActive, regenerate } =
      await request.validateUsing(registrationLinkValidator)

    let link = await RegistrationLink.findBy('eventId', event.id)
    if (!link) {
      link = await RegistrationLink.create({
        eventId: event.id,
        token: registrationLinkService.generateToken(),
        expiresAt: expiresAt ?? null,
        isActive: isActive ?? true,
      })
      session.flash('success', 'Registration link created.')
      return response.redirect().toRoute('events.show', { id: event.id })
    }

    link.expiresAt = expiresAt ?? null
    if (isActive !== undefined) {
      link.isActive = isActive
    }
    if (regenerate) {
      link.token = registrationLinkService.generateToken()
    }
    await link.save()

    session.flash(
      'success',
      regenerate ? 'Registration link regenerated.' : 'Registration link updated.'
    )
    return response.redirect().toRoute('events.show', { id: event.id })
  }

  async destroy({ params, auth, response, session }: HttpContext) {
    const event = await this.findOwnedEvent(auth.user!.id, params.eventId)
    if (!event) {
      return response.notFound('Event not found')
    }

    const link = await RegistrationLink.findBy('eventId', event.id)
    if (link) {
      await link.delete()
    }

    session.flash('success', 'Registration link removed.')
    return response.redirect().toRoute('events.show', { id: event.id })
  }

  private findOwnedEvent(userId: number, eventId: number | string) {
    return Event.query().where('id', eventId).where('userId', userId).first()
  }
}
