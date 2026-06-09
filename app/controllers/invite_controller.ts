import { Buffer } from 'node:buffer'
import { DateTime } from 'luxon'
import env from '#start/env'
import Invitation from '#models/invitation'
import CardTemplate from '#models/card_template'
import qrService from '#services/qr_service'
import cardRenderService from '#services/card_render_service'
import invitationService from '#services/invitation_service'
import { formatEventWhen, resolveMapUrl } from '#services/event_presenter_service'
import { rsvpValidator } from '#validators/guest'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Public, server-rendered (Edge) invitation page reached via the QR code / share
 * link at /i/:token. Includes OG tags for rich link previews.
 */
export default class InviteController {
  async show({ params, view, response }: HttpContext) {
    const invitation = await this.loadInvitation(params.token)
    if (!invitation) {
      response.status(404)
      return view.render('invite/not_found')
    }

    /**
     * Record the first view of the invitation.
     */
    if (!invitation.viewedAt) {
      invitation.viewedAt = DateTime.now()
      if (invitation.status === 'pending' || invitation.status === 'sent') {
        invitation.status = 'viewed'
      }
      await invitation.save()
    }

    const { event, guest } = invitation
    const inviteUrl = invitationService.inviteUrl(invitation.token)
    const qrSvg = await qrService.toSvg(inviteUrl)
    const hasCard = await CardTemplate.query().where('eventId', event.id).first()

    return view.render('invite/show', {
      appUrl: env.get('APP_URL'),
      inviteUrl,
      qrSvg,
      hasCard: !!hasCard,
      token: invitation.token,
      guest: { name: guest.name, rsvpStatus: guest.rsvpStatus },
      event: {
        title: event.title,
        description: event.description,
        location: event.location,
        mapUrl: resolveMapUrl(event.location, event.mapUrl),
        allowPublicRsvp: event.allowPublicRsvp,
        when: formatEventWhen(event.startsAt, event.endsAt),
      },
    })
  }

  /**
   * Serve the guest's personalized invitation card as a PDF — the same card the
   * event owner can download (see CardController.generate), reached by the public
   * invite token rather than auth.
   */
  async card({ params, response }: HttpContext) {
    const invitation = await this.loadInvitation(params.token)
    if (!invitation) {
      return response.notFound('Invitation not found')
    }

    const { event, guest } = invitation
    const template = await CardTemplate.findBy('eventId', event.id)
    if (!template) {
      return response.notFound('No card has been designed for this event yet.')
    }

    const pdf = await cardRenderService.toPdf(
      template,
      invitationService.inviteUrl(invitation.token),
      {
        eventTitle: event.title,
        guestName: guest.name,
        eventDate: event.startsAt
          ? event.startsAt.setZone('UTC').toFormat('cccc, dd LLL yyyy • t')
          : '',
      }
    )

    response.header('Content-Type', 'application/pdf')
    response.header(
      'Content-Disposition',
      `attachment; filename="invitation-${event.id}-${guest.id}.pdf"`
    )
    return response.send(Buffer.from(pdf))
  }

  async rsvp({ params, request, response, session, view }: HttpContext) {
    const invitation = await this.loadInvitation(params.token)
    if (!invitation) {
      response.status(404)
      return view.render('invite/not_found')
    }

    if (!invitation.event.allowPublicRsvp) {
      session.flash('error', 'RSVP is closed for this event.')
      return response.redirect().back()
    }

    const { rsvpStatus } = await rsvpValidator.validate(request.only(['rsvpStatus']))
    invitation.guest.rsvpStatus = rsvpStatus
    await invitation.guest.save()

    session.flash(
      'success',
      rsvpStatus === 'confirmed'
        ? "You're confirmed — see you there!"
        : 'Your response was recorded.'
    )
    return response.redirect().back()
  }

  private loadInvitation(token: string) {
    return Invitation.query().where('token', token).preload('guest').preload('event').first()
  }
}
