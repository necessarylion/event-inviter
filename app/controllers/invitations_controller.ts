import Event from '#models/event'
import Guest from '#models/guest'
import invitationService from '#services/invitation_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class InvitationsController {
  /**
   * Email an invitation to a single guest (must have an email address).
   */
  async email({ params, auth, response, session }: HttpContext) {
    const user = auth.user!
    const found = await this.findOwned(user.id, params.eventId, params.guestId)
    if (!found) {
      return response.notFound('Guest not found')
    }
    const { event, guest } = found

    if (!guest.email) {
      session.flash('error', `${guest.name} has no email address.`)
      return response.redirect().toRoute('events.show', { id: event.id })
    }

    const ok = await invitationService.sendEmailInvitation(event, guest)
    if (ok) {
      session.flash('success', `Invitation emailed to ${guest.email}.`)
    } else {
      session.flash('error', `Could not send the invitation to ${guest.email}.`)
    }

    return response.redirect().toRoute('events.show', { id: event.id })
  }

  /**
   * Email invitations to every guest who has an email address.
   */
  async emailAll({ params, auth, response, session }: HttpContext) {
    const user = auth.user!
    const event = await Event.query().where('id', params.eventId).where('userId', user.id).first()
    if (!event) {
      return response.notFound('Event not found')
    }

    await event.load('guests', (query) => query.whereNotNull('email'))

    let sent = 0
    for (const guest of event.guests) {
      if (await invitationService.sendEmailInvitation(event, guest)) {
        sent += 1
      }
    }

    session.flash('success', `Sent ${sent} invitation${sent === 1 ? '' : 's'}.`)
    return response.redirect().toRoute('events.show', { id: event.id })
  }

  private async findOwned(userId: number, eventId: number | string, guestId: number | string) {
    const event = await Event.query().where('id', eventId).where('userId', userId).first()
    if (!event) {
      return null
    }
    const guest = await Guest.query().where('id', guestId).where('eventId', event.id).first()
    if (!guest) {
      return null
    }
    return { event, guest }
  }
}
