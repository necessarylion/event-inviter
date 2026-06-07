import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import User from '#models/user'
import Event from '#models/event'
import Guest from '#models/guest'
import testUtils from '@adonisjs/core/services/test_utils'
import invitationService from '#services/invitation_service'

test.group('Invite & check-in flow', (group) => {
  // Roll back DB changes after every test.
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function makeOwner() {
    return User.create({ fullName: 'Olivia Owner', email: 'owner@test.dev', password: 'secret123' })
  }

  async function makeEventWithGuest(owner: User) {
    const event = await Event.create({
      userId: owner.id,
      title: 'Launch Party',
      slug: `launch-${owner.id}`,
      startsAt: DateTime.now().plus({ days: 7 }),
      timezone: 'UTC',
      status: 'published',
      allowPublicRsvp: true,
    })
    const guest = await Guest.create({
      eventId: event.id,
      name: 'Greta Guest',
      email: 'greta@test.dev',
    })
    const invitation = await invitationService.forGuest(guest, 'link')
    return { event, guest, invitation }
  }

  test('public landing page renders for SEO', async ({ client }) => {
    const response = await client.get('/')
    response.assertStatus(200)
    response.assertTextIncludes('Guest Invite')
    response.assertTextIncludes('application/ld+json')
  })

  test('public invite page resolves a valid token', async ({ client }) => {
    const owner = await makeOwner()
    const { invitation } = await makeEventWithGuest(owner)

    const response = await client.get(`/i/${invitation.token}`)
    response.assertStatus(200)
    response.assertTextIncludes('Launch Party')
    response.assertTextIncludes('Greta Guest')
  })

  test('unknown invite token returns 404', async ({ client }) => {
    const response = await client.get('/i/this-token-does-not-exist')
    response.assertStatus(404)
  })

  test('owner can check a guest in, and re-scanning reports already checked in', async ({
    client,
    assert,
  }) => {
    const owner = await makeOwner()
    const { event, guest, invitation } = await makeEventWithGuest(owner)

    const first = await client
      .post(`/events/${event.id}/check-in`)
      .loginAs(owner)
      .json({ code: invitation.token })
    first.assertStatus(200)
    first.assertBodyContains({ status: 'ok', guest: { name: 'Greta Guest' } })

    await guest.refresh()
    assert.isNotNull(guest.checkedInAt)
    assert.equal(guest.checkedInById, owner.id)

    const second = await client
      .post(`/events/${event.id}/check-in`)
      .loginAs(owner)
      .json({ code: invitation.token })
    second.assertStatus(200)
    second.assertBodyContains({ status: 'already' })
  })

  test('check-in rejects an unknown code', async ({ client }) => {
    const owner = await makeOwner()
    const { event } = await makeEventWithGuest(owner)

    const response = await client
      .post(`/events/${event.id}/check-in`)
      .loginAs(owner)
      .json({ code: 'bogus-token' })
    response.assertStatus(200)
    response.assertBodyContains({ status: 'invalid' })
  })

  test('check-in requires authentication', async ({ client }) => {
    const owner = await makeOwner()
    const { event, invitation } = await makeEventWithGuest(owner)

    const response = await client
      .post(`/events/${event.id}/check-in`)
      .json({ code: invitation.token })
      .redirects(0)
    // Auth middleware redirects unauthenticated users to /login
    response.assertStatus(302)
  })
})
