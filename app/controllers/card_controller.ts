import { Buffer } from 'node:buffer'
import { DateTime } from 'luxon'
import Event from '#models/event'
import Guest from '#models/guest'
import CardTemplate from '#models/card_template'
import TemplatePreset from '#models/template_preset'
import mailerFactory from '#services/mailer_factory'
import cardRenderService from '#services/card_render_service'
import cardTemplateService from '#services/card_template_service'
import invitationService from '#services/invitation_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class CardController {
  /**
   * The pdfme card designer page.
   */
  async design({ params, auth, inertia, response }: HttpContext) {
    const event = await this.findOwnedEvent(auth.user!.id, params.eventId)
    if (!event) {
      return response.notFound('Event not found')
    }

    const existing = await CardTemplate.findBy('eventId', event.id)
    const sampleQrUrl = invitationService.inviteUrl('SAMPLE')
    const presets = await TemplatePreset.query().where('isPublished', true).orderBy('name', 'asc')

    return inertia.render('events/card_designer', {
      event: { id: event.id, title: event.title },
      template: existing
        ? existing.template
        : cardTemplateService.defaultTemplate(event.title, sampleQrUrl),
      presets: presets.map((preset) => ({
        id: preset.id,
        name: preset.name,
        template: preset.template,
        previewImage: preset.previewImage,
      })),
    })
  }

  /**
   * Persist the pdfme template. Enforces that a QR code field is present.
   */
  async save({ params, request, auth, response, session }: HttpContext) {
    const event = await this.findOwnedEvent(auth.user!.id, params.eventId)
    if (!event) {
      return response.notFound('Event not found')
    }

    const parsed = cardTemplateService.parseAndValidate(request.input('template'))
    if (!parsed || !parsed.hasQr) {
      session.flash('error', 'The card must include a QR code field.')
      return response.redirect().back()
    }

    await CardTemplate.updateOrCreate(
      { eventId: event.id },
      {
        eventId: event.id,
        name: 'Invitation card',
        designJson: parsed.template,
        ...cardTemplateService.dimensions(parsed.template),
      }
    )

    session.flash('success', 'Card design saved.')
    return response.redirect().back()
  }

  /**
   * Serve a guest's personalized card as a PDF. The browser rasterizes it to a
   * PNG for download (see use_card_image) — keeping the slow PDF→image step off
   * the server for the interactive path.
   */
  async generate({ params, auth, response, session }: HttpContext) {
    const found = await this.findOwnedGuest(auth.user!.id, params.eventId, params.guestId)
    if (!found) {
      return response.notFound('Guest not found')
    }
    const { event, guest } = found

    const template = await CardTemplate.findBy('eventId', event.id)
    if (!template) {
      session.flash('error', 'Design a card for this event first.')
      return response.redirect().toRoute('cards.design', { eventId: event.id })
    }

    const invitation = await invitationService.forGuest(guest, 'card')
    const pdf = await cardRenderService.toPdf(
      template,
      invitationService.inviteUrl(invitation.token),
      this.fieldsFor(event, guest)
    )

    response.header('Content-Type', 'application/pdf')
    response.header(
      'Content-Disposition',
      `inline; filename="invitation-${event.id}-${guest.id}.pdf"`
    )
    return response.send(Buffer.from(pdf))
  }

  /**
   * Email a guest their personalized card as a PNG image attachment.
   */
  async emailCard({ params, auth, response, session }: HttpContext) {
    const user = auth.user!
    const found = await this.findOwnedGuest(user.id, params.eventId, params.guestId)
    if (!found) {
      return response.notFound('Guest not found')
    }
    const { event, guest } = found

    if (!guest.email) {
      session.flash('error', `${guest.name} has no email address.`)
      return response.redirect().toRoute('events.show', { id: event.id })
    }

    const template = await CardTemplate.findBy('eventId', event.id)
    if (!template) {
      session.flash('error', 'Design a card for this event first.')
      return response.redirect().toRoute('cards.design', { eventId: event.id })
    }

    const invitation = await invitationService.forGuest(guest, 'card')
    const png = await cardRenderService.toPng(
      template,
      invitationService.inviteUrl(invitation.token),
      this.fieldsFor(event, guest)
    )

    try {
      const { mailer, from } = await mailerFactory.forUser(user.id)
      await mailer.send((message) => {
        if (from) {
          message.from(from.address, from.name)
        }
        message
          .to(guest.email!)
          .subject(`Your invitation card — ${event.title}`)
          .html(
            '<p>Your personalized invitation card is attached. Show its QR code at the door.</p>'
          )
        message.attachData(Buffer.from(png), {
          filename: 'invitation.png',
          contentType: 'image/png',
        })
      })
      invitation.status = 'sent'
      invitation.sentAt = DateTime.now()
      await invitation.save()
      session.flash('success', `Card emailed to ${guest.email}.`)
    } catch {
      invitation.status = 'failed'
      await invitation.save()
      session.flash('error', `Could not email the card to ${guest.email}.`)
    }

    return response.redirect().toRoute('events.show', { id: event.id })
  }

  /**
   * Text-field values injected into the template per guest. Keys that don't
   * match a field in the template are ignored by pdfme.
   */
  private fieldsFor(event: Event, guest: Guest) {
    return {
      eventTitle: event.title,
      guestName: guest.name,
      eventDate: event.startsAt
        ? event.startsAt.setZone(event.timezone || 'UTC').toFormat('cccc, dd LLL yyyy • t')
        : '',
    }
  }

  private findOwnedEvent(userId: number, eventId: number | string) {
    return Event.query().where('id', eventId).where('userId', userId).first()
  }

  private async findOwnedGuest(userId: number, eventId: number | string, guestId: number | string) {
    const event = await this.findOwnedEvent(userId, eventId)
    if (!event) {
      return null
    }
    const guest = await Guest.query().where('id', guestId).where('eventId', event.id).first()
    return guest ? { event, guest } : null
  }
}
