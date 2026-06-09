import db from '@adonisjs/lucid/services/db'
import env from '#start/env'
import { DateTime } from 'luxon'
import Event from '#models/event'
import Guest from '#models/guest'
import invitationService from '#services/invitation_service'
import guestRegistrationService from '#services/guest_registration_service'
import { formatEventWhen, resolveMapUrl } from '#services/event_presenter_service'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Public, server-rendered (Edge) pages for events an owner has marked public
 * (`isPublic`). The listing and detail pages are discoverable/SEO-facing.
 * Joining requires a logged-in account: a visitor who isn't signed in is sent to
 * login (and returned to the event afterwards), while a signed-in visitor joins
 * in one click using their account details — no form. Joining registers them as
 * a confirmed guest, emails their invite, and lands them on their personal
 * invite page (/i/:token).
 */
export default class PublicEventsController {
  /**
   * Public listing of upcoming public events.
   */
  async index({ view, auth }: HttpContext) {
    const events = await Event.query()
      .where('isPublic', true)
      .where('startsAt', '>=', DateTime.now().toSQL({ includeOffset: false })!)
      .orderBy('startsAt', 'asc')

    return view.render('events/index', {
      appUrl: env.get('APP_URL'),
      isAuthenticated: Boolean(auth.user),
      events: events.map((event) => this.cardProps(event)),
    })
  }

  /**
   * Public event detail + one-click join.
   */
  async show({ params, request, view, auth, response }: HttpContext) {
    const event = await this.loadPublic(params.slug)
    if (!event) {
      response.status(404)
      return view.render('invite/not_found')
    }

    /**
     * Show the "You're invited" framing only when the visitor arrived from a
     * shared/invitation link. Cards on the public listing append `?ref=list`,
     * so that internal browsing path is treated as discovery, not an invite.
     */
    const invited = request.qs().ref !== 'list'

    const attendingCount = await this.attendingCount(event.id)

    /**
     * For a signed-in visitor who has already joined, surface a link to their
     * personal invite instead of the join button.
     */
    const user = auth.user
    let inviteToken: string | null = null
    if (user) {
      const guest = await this.findGuestByEmail(event.id, user.email)
      if (guest) {
        const invitation = await invitationService.forGuest(guest, 'link')
        inviteToken = invitation.token
      }
    }

    return view.render('events/public_show', {
      appUrl: env.get('APP_URL'),
      slug: event.slug,
      invited,
      isAuthenticated: Boolean(user),
      isLoggedIn: Boolean(user),
      attendingCount,
      inviteToken,
      publicUrl: this.publicUrl(event.slug),
      event: {
        title: event.title,
        description: event.description,
        location: event.location,
        mapUrl: resolveMapUrl(event.location, event.mapUrl),
        thumbnailUrl: event.thumbnailUrl,
        when: formatEventWhen(event.startsAt, event.endsAt),
      },
    })
  }

  /**
   * One-click join. Requires login: an unauthenticated visitor is sent to the
   * login page and returned here afterwards. A signed-in visitor is registered
   * as a confirmed guest using their account details (no form), emailed their
   * invite (best-effort), and landed on their personal invite page.
   */
  async join({ params, response, session, auth, view }: HttpContext) {
    const event = await this.loadPublic(params.slug)
    if (!event) {
      response.status(404)
      return view.render('invite/not_found')
    }

    /**
     * Gate join behind login, remembering the event so the visitor returns here
     * after signing in (see SessionController).
     */
    const user = auth.user
    if (!user) {
      session.put('returnTo', `/e/${event.slug}`)
      return response.redirect().toRoute('session.create')
    }

    const result = await guestRegistrationService.register(event.id, {
      name: user.fullName ?? user.email,
      email: user.email,
      phone: null,
    })

    /**
     * Already joined — send them to their existing invite rather than erroring.
     */
    if (!result.ok) {
      const guest = await this.findGuestByEmail(event.id, user.email)
      if (guest) {
        const invitation = await invitationService.forGuest(guest, 'link')
        return response.redirect().toRoute('invite.show', { token: invitation.token })
      }
      session.flash('error', 'You have already joined this event.')
      return response.redirect().toRoute('public_events.show', { slug: event.slug })
    }

    /**
     * Best-effort: email the guest their invite using the owner's mailer. The
     * join succeeds (and they still land on their invite page) even if the
     * owner hasn't configured email.
     */
    await invitationService.sendEmailInvitation(event, result.guest)

    return response.redirect().toRoute('invite.show', { token: result.invitation.token })
  }

  private cardProps(event: Event) {
    return {
      title: event.title,
      location: event.location,
      thumbnailUrl: event.thumbnailUrl,
      when: formatEventWhen(event.startsAt, event.endsAt),
      url: `${this.publicUrl(event.slug)}?ref=list`,
    }
  }

  private publicUrl(slug: string) {
    return new URL(`/e/${slug}`, env.get('APP_URL')).toString()
  }

  private loadPublic(slug: string) {
    return Event.query().where('slug', slug).where('isPublic', true).first()
  }

  /**
   * Count of confirmed (attending) guests for an event.
   */
  private async attendingCount(eventId: number) {
    const row = await db
      .from('guests')
      .where('event_id', eventId)
      .where('rsvp_status', 'confirmed')
      .count('* as total')
      .first()
    return Number(row?.total ?? 0)
  }

  /**
   * Find this event's guest matching an email (case-insensitive), if any.
   */
  private findGuestByEmail(eventId: number, email: string) {
    return Guest.query()
      .where('eventId', eventId)
      .whereRaw('lower(email) = ?', [email.toLowerCase()])
      .first()
  }
}
