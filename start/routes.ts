/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

/*
|--------------------------------------------------------------------------
| Public, SEO-facing pages (server-rendered with Edge)
|--------------------------------------------------------------------------
*/
router.get('/', [controllers.Pages, 'home']).as('home')
router.get('/robots.txt', [controllers.Pages, 'robots'])
router.get('/sitemap.xml', [controllers.Pages, 'sitemap'])

router.get('/i/:token', [controllers.Invite, 'show']).as('invite.show')
router.post('/i/:token/rsvp', [controllers.Invite, 'rsvp']).as('invite.rsvp')

/*
|--------------------------------------------------------------------------
| Guest-only auth pages
|--------------------------------------------------------------------------
*/
router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create']).as('new_account.create')
    router.post('signup', [controllers.NewAccount, 'store']).as('new_account.store')

    router.get('login', [controllers.Session, 'create']).as('session.create')
    router.post('login', [controllers.Session, 'store']).as('session.store')
  })
  .use(middleware.guest())

/*
|--------------------------------------------------------------------------
| Authenticated portal (Inertia SPA)
|--------------------------------------------------------------------------
*/
router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy']).as('session.destroy')

    router.get('dashboard', [controllers.Dashboard, 'index']).as('dashboard')

    /**
     * Events
     */
    router.get('events/create', [controllers.Events, 'create']).as('events.create')
    router.post('events', [controllers.Events, 'store']).as('events.store')
    router.get('events/:id', [controllers.Events, 'show']).as('events.show')
    router.get('events/:id/edit', [controllers.Events, 'edit']).as('events.edit')
    router.put('events/:id', [controllers.Events, 'update']).as('events.update')
    router.delete('events/:id', [controllers.Events, 'destroy']).as('events.destroy')

    /**
     * Guests (nested under an event)
     */
    router.post('events/:eventId/guests', [controllers.Guests, 'store']).as('guests.store')
    router.post('events/:eventId/guests/bulk', [controllers.Guests, 'bulkStore']).as('guests.bulk')
    router.put('events/:eventId/guests/:id', [controllers.Guests, 'update']).as('guests.update')
    router
      .delete('events/:eventId/guests/:id', [controllers.Guests, 'destroy'])
      .as('guests.destroy')

    /**
     * Invitations (email delivery)
     */
    router
      .post('events/:eventId/guests/:guestId/email', [controllers.Invitations, 'email'])
      .as('invitations.email')
    router
      .post('events/:eventId/invitations/email-all', [controllers.Invitations, 'emailAll'])
      .as('invitations.emailAll')

    /**
     * Check-in scanner
     */
    router.get('events/:eventId/scan', [controllers.CheckIns, 'scan']).as('checkins.scan')
    router.post('events/:eventId/check-in', [controllers.CheckIns, 'verify']).as('checkins.verify')

    /**
     * Invitation card designer + per-guest card. The download serves a PDF and
     * the browser rasterizes it to PNG (see use_card_image); email attaches a
     * server-rendered PNG.
     */
    router.get('events/:eventId/card', [controllers.Card, 'design']).as('cards.design')
    router.put('events/:eventId/card', [controllers.Card, 'save']).as('cards.save')
    router
      .get('events/:eventId/guests/:guestId/card.pdf', [controllers.Card, 'generate'])
      .as('cards.generate')
    router
      .post('events/:eventId/guests/:guestId/card/email', [controllers.Card, 'emailCard'])
      .as('cards.email')

    /**
     * Email provider settings
     */
    router.get('settings/email', [controllers.EmailSettings, 'edit']).as('email_settings.edit')
    router.put('settings/email', [controllers.EmailSettings, 'update']).as('email_settings.update')
    router
      .post('settings/email/test', [controllers.EmailSettings, 'test'])
      .as('email_settings.test')
  })
  .use(middleware.auth())
