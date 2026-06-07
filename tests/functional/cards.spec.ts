import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import User from '#models/user'
import Event from '#models/event'
import Guest from '#models/guest'
import CardTemplate from '#models/card_template'
import cardRenderService from '#services/card_render_service'
import testUtils from '@adonisjs/core/services/test_utils'

const templateWithQr = {
  basePdf: { width: 105, height: 148, padding: [10, 10, 10, 10] },
  schemas: [
    [
      {
        name: 'eventTitle',
        type: 'text',
        content: 'Title',
        position: { x: 10, y: 15 },
        width: 85,
        height: 12,
        fontSize: 18,
      },
      {
        name: 'qr',
        type: 'qrcode',
        content: 'sample',
        position: { x: 37, y: 55 },
        width: 30,
        height: 30,
      },
    ],
  ],
}

test.group('Card designer & PDF', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function setup() {
    const owner = await User.create({ email: 'owner@test.dev', password: 'secret123' })
    const event = await Event.create({
      userId: owner.id,
      title: 'Gala Dinner',
      slug: `gala-${owner.id}`,
      startsAt: DateTime.now().plus({ days: 14 }),
      timezone: 'UTC',
    })
    const guest = await Guest.create({ eventId: event.id, name: 'Carl Card' })
    return { owner, event, guest }
  }

  test('saving a template without a QR field is rejected', async ({ client, assert }) => {
    const { owner, event } = await setup()
    const noQr = { basePdf: { width: 105, height: 148, padding: [0, 0, 0, 0] }, schemas: [[]] }

    const response = await client
      .put(`/events/${event.id}/card`)
      .loginAs(owner)
      .json({ template: JSON.stringify(noQr) })
      .redirects(0)
    response.assertStatus(302)

    const saved = await CardTemplate.findBy('eventId', event.id)
    assert.isNull(saved)
  })

  test('saving a template with a QR field persists it', async ({ client, assert }) => {
    const { owner, event } = await setup()

    const response = await client
      .put(`/events/${event.id}/card`)
      .loginAs(owner)
      .json({ template: JSON.stringify(templateWithQr) })
      .redirects(0)
    response.assertStatus(302)

    const saved = await CardTemplate.findBy('eventId', event.id)
    assert.isNotNull(saved)
  })

  test('generating a guest card returns a PDF', async ({ client }) => {
    const { owner, event, guest } = await setup()
    await CardTemplate.create({ eventId: event.id, name: 'Card', designJson: templateWithQr })

    const response = await client
      .get(`/events/${event.id}/guests/${guest.id}/card.pdf`)
      .loginAs(owner)
    response.assertStatus(200)
    response.assertHeader('content-type', 'application/pdf')
  })

  test('generating a card renders multiVariableText fields with guest data', async ({ client }) => {
    const { owner, event, guest } = await setup()
    const mvtTemplate = {
      basePdf: { width: 105, height: 148, padding: [10, 10, 10, 10] },
      schemas: [
        [
          {
            name: 'greeting',
            type: 'multiVariableText',
            text: 'Dear {guestName},',
            content: JSON.stringify({ guestName: 'Sample' }),
            variables: ['guestName'],
            position: { x: 10, y: 15 },
            width: 85,
            height: 12,
            fontSize: 12,
          },
          {
            name: 'qr',
            type: 'qrcode',
            content: 'sample',
            position: { x: 37, y: 55 },
            width: 30,
            height: 30,
          },
        ],
      ],
    }
    await CardTemplate.create({ eventId: event.id, name: 'Card', designJson: mvtTemplate })

    // Renders without throwing → the multiVariableText plugin is registered and the
    // per-field variable input we build is valid JSON that pdfme accepts.
    const response = await client
      .get(`/events/${event.id}/guests/${guest.id}/card.pdf`)
      .loginAs(owner)
    response.assertStatus(200)
    response.assertHeader('content-type', 'application/pdf')
  })

  test('designer-placed images are embedded in the generated PDF', async ({ assert }) => {
    // A 2x2 PNG, big enough that embedding it changes the PDF size measurably.
    const png =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mP8z8Dwn4EIwDiqkL4KAcLIAv3aL0n0AAAAAElFTkSuQmCC'
    const qr = {
      name: 'qr',
      type: 'qrcode',
      content: 'sample',
      position: { x: 40, y: 80 },
      width: 25,
      height: 25,
    }
    const basePdf = { width: 105, height: 148, padding: [0, 0, 0, 0] }
    const withoutImage: any = { basePdf, schemas: [[qr]] }
    const withImage: any = {
      basePdf,
      schemas: [
        [
          {
            name: 'logo',
            type: 'image',
            content: png,
            position: { x: 10, y: 10 },
            width: 20,
            height: 20,
          },
          qr,
        ],
      ],
    }

    const ctPlain = new CardTemplate()
    ctPlain.designJson = withoutImage
    const ctImage = new CardTemplate()
    ctImage.designJson = withImage

    const pdfPlain = await cardRenderService.toPdf(ctPlain, 'https://x/i/TOK', {})
    const pdfImage = await cardRenderService.toPdf(ctImage, 'https://x/i/TOK', {})

    // If the image were dropped (the bug), both PDFs would be the same size.
    assert.isAbove(pdfImage.length, pdfPlain.length)
  })

  test('card designer page requires ownership', async ({ client }) => {
    const { event } = await setup()
    const stranger = await User.create({ email: 'stranger@test.dev', password: 'secret123' })

    const response = await client.get(`/events/${event.id}/card`).loginAs(stranger)
    response.assertStatus(404)
  })
})
