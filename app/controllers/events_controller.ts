import Event from '#models/event'
import { randomBytes } from 'node:crypto'
import string from '@adonisjs/core/helpers/string'
import invitationService from '#services/invitation_service'
import registrationLinkService from '#services/registration_link_service'
import type { HttpContext } from '@adonisjs/core/http'
import {
  createEventValidator,
  updateEventValidator,
  eventSettingsValidator,
} from '#validators/event'

export default class EventsController {
  async create({ inertia }: HttpContext) {
    return inertia.render('events/create', {})
  }

  async store({ request, response, auth, session }: HttpContext) {
    const payload = await request.validateUsing(createEventValidator)

    const event = await Event.create({
      ...payload,
      userId: auth.user!.id,
      slug: await this.uniqueSlug(payload.title),
    })

    session.flash('success', 'Event created.')
    return response.redirect().toRoute('events.show', { id: event.id })
  }

  async show({ params, auth, inertia, response }: HttpContext) {
    const event = await this.findOwned(auth.user!.id, params.id)
    if (!event) {
      return response.notFound('Event not found')
    }

    await event.load('guests', (query) => {
      query.preload('invitations').orderBy('name', 'asc')
    })

    const guests = event.guests.map((guest) => {
      const link = guest.invitations.find((invitation) => invitation.method === 'link')
      return {
        id: guest.id,
        name: guest.name,
        email: guest.email,
        phone: guest.phone,
        rsvpStatus: guest.rsvpStatus,
        checkedInAt: guest.checkedInAt?.toISO() ?? null,
        isCheckedIn: guest.isCheckedIn,
        inviteUrl: link ? invitationService.inviteUrl(link.token) : null,
        invitations: guest.invitations.map((invitation) => ({
          method: invitation.method,
          status: invitation.status,
          url: invitationService.inviteUrl(invitation.token),
        })),
      }
    })

    return inertia.render('events/show', {
      event: {
        id: event.id,
        title: event.title,
        location: event.location,
        startsAt: event.startsAt?.toISO() ?? null,
      },
      guests,
      stats: {
        total: guests.length,
        confirmed: guests.filter((g) => g.rsvpStatus === 'confirmed').length,
        declined: guests.filter((g) => g.rsvpStatus === 'declined').length,
        checkedIn: guests.filter((g) => g.isCheckedIn).length,
      },
    })
  }

  async edit({ params, auth, inertia, response }: HttpContext) {
    const event = await this.findOwned(auth.user!.id, params.id)
    if (!event) {
      return response.notFound('Event not found')
    }

    return inertia.render('events/edit', {
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        startsAt: event.startsAt?.toISO() ?? null,
        endsAt: event.endsAt?.toISO() ?? null,
        allowPublicRsvp: event.allowPublicRsvp,
      },
    })
  }

  async update({ params, request, auth, response, session }: HttpContext) {
    const event = await this.findOwned(auth.user!.id, params.id)
    if (!event) {
      return response.notFound('Event not found')
    }

    const payload = await request.validateUsing(updateEventValidator)
    event.merge(payload)
    await event.save()

    session.flash('success', 'Event updated.')
    return response.redirect().toRoute('events.show', { id: event.id })
  }

  /**
   * Per-event settings page: public RSVP toggle + the shareable registration
   * link (managed via RegistrationLinksController).
   */
  async settings({ params, auth, inertia, response }: HttpContext) {
    const event = await this.findOwned(auth.user!.id, params.id)
    if (!event) {
      return response.notFound('Event not found')
    }

    await event.load('registrationLink')
    const link = event.registrationLink

    return inertia.render('events/settings', {
      event: {
        id: event.id,
        title: event.title,
        allowPublicRsvp: event.allowPublicRsvp,
      },
      registrationLink: link
        ? {
            url: registrationLinkService.registrationUrl(link.token),
            isActive: link.isActive,
            expiresAt: link.expiresAt?.toISO() ?? null,
            isExpired: link.isExpired,
            isUsable: link.isUsable,
          }
        : null,
    })
  }

  async updateSettings({ params, request, auth, response, session }: HttpContext) {
    const event = await this.findOwned(auth.user!.id, params.id)
    if (!event) {
      return response.notFound('Event not found')
    }

    const payload = await request.validateUsing(eventSettingsValidator)
    event.merge(payload)
    await event.save()

    session.flash('success', 'Settings saved.')
    return response.redirect().toRoute('events.settings', { id: event.id })
  }

  async destroy({ params, auth, response, session }: HttpContext) {
    const event = await this.findOwned(auth.user!.id, params.id)
    if (!event) {
      return response.notFound('Event not found')
    }

    await event.delete()
    session.flash('success', 'Event deleted.')
    return response.redirect().toRoute('dashboard')
  }

  /**
   * Loads an event only if it belongs to the given user (ownership guard).
   */
  private findOwned(userId: number, id: number | string) {
    return Event.query().where('id', id).where('userId', userId).first()
  }

  /**
   * Builds a URL-friendly, collision-resistant slug from the event title.
   */
  private async uniqueSlug(title: string) {
    const base = string.slug(title, { lower: true }) || 'event'
    return `${base}-${randomBytes(3).toString('hex')}`
  }
}
