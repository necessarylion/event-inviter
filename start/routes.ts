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
router.get('/i/:token/card', [controllers.Invite, 'card']).as('invite.card')
router.post('/i/:token/rsvp', [controllers.Invite, 'rsvp']).as('invite.rsvp')

/**
 * Public, event-level self-registration link (one per event). Anyone with the
 * link can register as a guest until it's disabled or expires.
 */
router.get('/r/:token', [controllers.Registrations, 'show']).as('registrations.show')
router.post('/r/:token', [controllers.Registrations, 'register']).as('registrations.register')

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

    router.post('auth/google', [controllers.Session, 'google']).as('session.google')
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
    router.get('events/:id/settings', [controllers.Events, 'settings']).as('events.settings')
    router
      .put('events/:id/settings', [controllers.Events, 'updateSettings'])
      .as('events.updateSettings')
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
     * Public registration link (one per event) — create / set expiry /
     * enable-disable / regenerate, and remove.
     */
    router
      .post('events/:eventId/registration-link', [controllers.RegistrationLinks, 'store'])
      .as('registration_links.store')
    router
      .delete('events/:eventId/registration-link', [controllers.RegistrationLinks, 'destroy'])
      .as('registration_links.destroy')

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
    router
      .post('events/:eventId/guests/:id/check-in', [controllers.CheckIns, 'manual'])
      .as('checkins.manual')

    /**
     * Invitation card designer + per-guest card. The download serves a PDF and
     * the browser rasterizes it to PNG (see use_card_image); email attaches a
     * server-rendered PNG.
     */
    router.get('events/:eventId/card', [controllers.Card, 'design']).as('cards.design')
    router.put('events/:eventId/card', [controllers.Card, 'save']).as('cards.save')
    router.put('events/:eventId/card/autosave', [controllers.Card, 'autosave']).as('cards.autosave')
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

/*
|--------------------------------------------------------------------------
| Admin panel (system card templates) — auth + admin allowlist
|--------------------------------------------------------------------------
*/
router
  .group(() => {
    router.get('templates', [controllers.AdminTemplates, 'index']).as('admin.templates.index')
    router.get('templates/new', [controllers.AdminTemplates, 'create']).as('admin.templates.create')
    router.post('templates', [controllers.AdminTemplates, 'store']).as('admin.templates.store')
    router
      .get('templates/:id/edit', [controllers.AdminTemplates, 'edit'])
      .as('admin.templates.edit')
    router.put('templates/:id', [controllers.AdminTemplates, 'update']).as('admin.templates.update')
    router
      .put('templates/:id/autosave', [controllers.AdminTemplates, 'autosave'])
      .as('admin.templates.autosave')
    router
      .put('templates/:id/publish', [controllers.AdminTemplates, 'togglePublish'])
      .as('admin.templates.publish')
    router
      .delete('templates/:id', [controllers.AdminTemplates, 'destroy'])
      .as('admin.templates.destroy')
  })
  .prefix('admin')
  .use([middleware.auth(), middleware.admin()])
