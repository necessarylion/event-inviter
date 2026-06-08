/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'pages.robots': {
    methods: ["GET","HEAD"],
    pattern: '/robots.txt',
    tokens: [{"old":"/robots.txt","type":0,"val":"robots.txt","end":""}],
    types: placeholder as Registry['pages.robots']['types'],
  },
  'pages.sitemap': {
    methods: ["GET","HEAD"],
    pattern: '/sitemap.xml',
    tokens: [{"old":"/sitemap.xml","type":0,"val":"sitemap.xml","end":""}],
    types: placeholder as Registry['pages.sitemap']['types'],
  },
  'invite.show': {
    methods: ["GET","HEAD"],
    pattern: '/i/:token',
    tokens: [{"old":"/i/:token","type":0,"val":"i","end":""},{"old":"/i/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['invite.show']['types'],
  },
  'invite.card': {
    methods: ["GET","HEAD"],
    pattern: '/i/:token/card',
    tokens: [{"old":"/i/:token/card","type":0,"val":"i","end":""},{"old":"/i/:token/card","type":1,"val":"token","end":""},{"old":"/i/:token/card","type":0,"val":"card","end":""}],
    types: placeholder as Registry['invite.card']['types'],
  },
  'invite.rsvp': {
    methods: ["POST"],
    pattern: '/i/:token/rsvp',
    tokens: [{"old":"/i/:token/rsvp","type":0,"val":"i","end":""},{"old":"/i/:token/rsvp","type":1,"val":"token","end":""},{"old":"/i/:token/rsvp","type":0,"val":"rsvp","end":""}],
    types: placeholder as Registry['invite.rsvp']['types'],
  },
  'registrations.show': {
    methods: ["GET","HEAD"],
    pattern: '/r/:token',
    tokens: [{"old":"/r/:token","type":0,"val":"r","end":""},{"old":"/r/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['registrations.show']['types'],
  },
  'registrations.register': {
    methods: ["POST"],
    pattern: '/r/:token',
    tokens: [{"old":"/r/:token","type":0,"val":"r","end":""},{"old":"/r/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['registrations.register']['types'],
  },
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.store']['types'],
  },
  'session.google': {
    methods: ["POST"],
    pattern: '/auth/google',
    tokens: [{"old":"/auth/google","type":0,"val":"auth","end":""},{"old":"/auth/google","type":0,"val":"google","end":""}],
    types: placeholder as Registry['session.google']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['session.destroy']['types'],
  },
  'dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard',
    tokens: [{"old":"/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['dashboard']['types'],
  },
  'events.create': {
    methods: ["GET","HEAD"],
    pattern: '/events/create',
    tokens: [{"old":"/events/create","type":0,"val":"events","end":""},{"old":"/events/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['events.create']['types'],
  },
  'events.store': {
    methods: ["POST"],
    pattern: '/events',
    tokens: [{"old":"/events","type":0,"val":"events","end":""}],
    types: placeholder as Registry['events.store']['types'],
  },
  'events.show': {
    methods: ["GET","HEAD"],
    pattern: '/events/:id',
    tokens: [{"old":"/events/:id","type":0,"val":"events","end":""},{"old":"/events/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['events.show']['types'],
  },
  'events.edit': {
    methods: ["GET","HEAD"],
    pattern: '/events/:id/edit',
    tokens: [{"old":"/events/:id/edit","type":0,"val":"events","end":""},{"old":"/events/:id/edit","type":1,"val":"id","end":""},{"old":"/events/:id/edit","type":0,"val":"edit","end":""}],
    types: placeholder as Registry['events.edit']['types'],
  },
  'events.settings': {
    methods: ["GET","HEAD"],
    pattern: '/events/:id/settings',
    tokens: [{"old":"/events/:id/settings","type":0,"val":"events","end":""},{"old":"/events/:id/settings","type":1,"val":"id","end":""},{"old":"/events/:id/settings","type":0,"val":"settings","end":""}],
    types: placeholder as Registry['events.settings']['types'],
  },
  'events.updateSettings': {
    methods: ["PUT"],
    pattern: '/events/:id/settings',
    tokens: [{"old":"/events/:id/settings","type":0,"val":"events","end":""},{"old":"/events/:id/settings","type":1,"val":"id","end":""},{"old":"/events/:id/settings","type":0,"val":"settings","end":""}],
    types: placeholder as Registry['events.updateSettings']['types'],
  },
  'events.update': {
    methods: ["PUT"],
    pattern: '/events/:id',
    tokens: [{"old":"/events/:id","type":0,"val":"events","end":""},{"old":"/events/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['events.update']['types'],
  },
  'events.destroy': {
    methods: ["DELETE"],
    pattern: '/events/:id',
    tokens: [{"old":"/events/:id","type":0,"val":"events","end":""},{"old":"/events/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['events.destroy']['types'],
  },
  'guests.store': {
    methods: ["POST"],
    pattern: '/events/:eventId/guests',
    tokens: [{"old":"/events/:eventId/guests","type":0,"val":"events","end":""},{"old":"/events/:eventId/guests","type":1,"val":"eventId","end":""},{"old":"/events/:eventId/guests","type":0,"val":"guests","end":""}],
    types: placeholder as Registry['guests.store']['types'],
  },
  'guests.bulk': {
    methods: ["POST"],
    pattern: '/events/:eventId/guests/bulk',
    tokens: [{"old":"/events/:eventId/guests/bulk","type":0,"val":"events","end":""},{"old":"/events/:eventId/guests/bulk","type":1,"val":"eventId","end":""},{"old":"/events/:eventId/guests/bulk","type":0,"val":"guests","end":""},{"old":"/events/:eventId/guests/bulk","type":0,"val":"bulk","end":""}],
    types: placeholder as Registry['guests.bulk']['types'],
  },
  'guests.update': {
    methods: ["PUT"],
    pattern: '/events/:eventId/guests/:id',
    tokens: [{"old":"/events/:eventId/guests/:id","type":0,"val":"events","end":""},{"old":"/events/:eventId/guests/:id","type":1,"val":"eventId","end":""},{"old":"/events/:eventId/guests/:id","type":0,"val":"guests","end":""},{"old":"/events/:eventId/guests/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['guests.update']['types'],
  },
  'guests.destroy': {
    methods: ["DELETE"],
    pattern: '/events/:eventId/guests/:id',
    tokens: [{"old":"/events/:eventId/guests/:id","type":0,"val":"events","end":""},{"old":"/events/:eventId/guests/:id","type":1,"val":"eventId","end":""},{"old":"/events/:eventId/guests/:id","type":0,"val":"guests","end":""},{"old":"/events/:eventId/guests/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['guests.destroy']['types'],
  },
  'registration_links.store': {
    methods: ["POST"],
    pattern: '/events/:eventId/registration-link',
    tokens: [{"old":"/events/:eventId/registration-link","type":0,"val":"events","end":""},{"old":"/events/:eventId/registration-link","type":1,"val":"eventId","end":""},{"old":"/events/:eventId/registration-link","type":0,"val":"registration-link","end":""}],
    types: placeholder as Registry['registration_links.store']['types'],
  },
  'registration_links.destroy': {
    methods: ["DELETE"],
    pattern: '/events/:eventId/registration-link',
    tokens: [{"old":"/events/:eventId/registration-link","type":0,"val":"events","end":""},{"old":"/events/:eventId/registration-link","type":1,"val":"eventId","end":""},{"old":"/events/:eventId/registration-link","type":0,"val":"registration-link","end":""}],
    types: placeholder as Registry['registration_links.destroy']['types'],
  },
  'invitations.email': {
    methods: ["POST"],
    pattern: '/events/:eventId/guests/:guestId/email',
    tokens: [{"old":"/events/:eventId/guests/:guestId/email","type":0,"val":"events","end":""},{"old":"/events/:eventId/guests/:guestId/email","type":1,"val":"eventId","end":""},{"old":"/events/:eventId/guests/:guestId/email","type":0,"val":"guests","end":""},{"old":"/events/:eventId/guests/:guestId/email","type":1,"val":"guestId","end":""},{"old":"/events/:eventId/guests/:guestId/email","type":0,"val":"email","end":""}],
    types: placeholder as Registry['invitations.email']['types'],
  },
  'invitations.emailAll': {
    methods: ["POST"],
    pattern: '/events/:eventId/invitations/email-all',
    tokens: [{"old":"/events/:eventId/invitations/email-all","type":0,"val":"events","end":""},{"old":"/events/:eventId/invitations/email-all","type":1,"val":"eventId","end":""},{"old":"/events/:eventId/invitations/email-all","type":0,"val":"invitations","end":""},{"old":"/events/:eventId/invitations/email-all","type":0,"val":"email-all","end":""}],
    types: placeholder as Registry['invitations.emailAll']['types'],
  },
  'checkins.scan': {
    methods: ["GET","HEAD"],
    pattern: '/events/:eventId/scan',
    tokens: [{"old":"/events/:eventId/scan","type":0,"val":"events","end":""},{"old":"/events/:eventId/scan","type":1,"val":"eventId","end":""},{"old":"/events/:eventId/scan","type":0,"val":"scan","end":""}],
    types: placeholder as Registry['checkins.scan']['types'],
  },
  'checkins.verify': {
    methods: ["POST"],
    pattern: '/events/:eventId/check-in',
    tokens: [{"old":"/events/:eventId/check-in","type":0,"val":"events","end":""},{"old":"/events/:eventId/check-in","type":1,"val":"eventId","end":""},{"old":"/events/:eventId/check-in","type":0,"val":"check-in","end":""}],
    types: placeholder as Registry['checkins.verify']['types'],
  },
  'checkins.manual': {
    methods: ["POST"],
    pattern: '/events/:eventId/guests/:id/check-in',
    tokens: [{"old":"/events/:eventId/guests/:id/check-in","type":0,"val":"events","end":""},{"old":"/events/:eventId/guests/:id/check-in","type":1,"val":"eventId","end":""},{"old":"/events/:eventId/guests/:id/check-in","type":0,"val":"guests","end":""},{"old":"/events/:eventId/guests/:id/check-in","type":1,"val":"id","end":""},{"old":"/events/:eventId/guests/:id/check-in","type":0,"val":"check-in","end":""}],
    types: placeholder as Registry['checkins.manual']['types'],
  },
  'cards.design': {
    methods: ["GET","HEAD"],
    pattern: '/events/:eventId/card',
    tokens: [{"old":"/events/:eventId/card","type":0,"val":"events","end":""},{"old":"/events/:eventId/card","type":1,"val":"eventId","end":""},{"old":"/events/:eventId/card","type":0,"val":"card","end":""}],
    types: placeholder as Registry['cards.design']['types'],
  },
  'cards.save': {
    methods: ["PUT"],
    pattern: '/events/:eventId/card',
    tokens: [{"old":"/events/:eventId/card","type":0,"val":"events","end":""},{"old":"/events/:eventId/card","type":1,"val":"eventId","end":""},{"old":"/events/:eventId/card","type":0,"val":"card","end":""}],
    types: placeholder as Registry['cards.save']['types'],
  },
  'cards.autosave': {
    methods: ["PUT"],
    pattern: '/events/:eventId/card/autosave',
    tokens: [{"old":"/events/:eventId/card/autosave","type":0,"val":"events","end":""},{"old":"/events/:eventId/card/autosave","type":1,"val":"eventId","end":""},{"old":"/events/:eventId/card/autosave","type":0,"val":"card","end":""},{"old":"/events/:eventId/card/autosave","type":0,"val":"autosave","end":""}],
    types: placeholder as Registry['cards.autosave']['types'],
  },
  'cards.generate': {
    methods: ["GET","HEAD"],
    pattern: '/events/:eventId/guests/:guestId/card.pdf',
    tokens: [{"old":"/events/:eventId/guests/:guestId/card.pdf","type":0,"val":"events","end":""},{"old":"/events/:eventId/guests/:guestId/card.pdf","type":1,"val":"eventId","end":""},{"old":"/events/:eventId/guests/:guestId/card.pdf","type":0,"val":"guests","end":""},{"old":"/events/:eventId/guests/:guestId/card.pdf","type":1,"val":"guestId","end":""},{"old":"/events/:eventId/guests/:guestId/card.pdf","type":0,"val":"card.pdf","end":""}],
    types: placeholder as Registry['cards.generate']['types'],
  },
  'cards.email': {
    methods: ["POST"],
    pattern: '/events/:eventId/guests/:guestId/card/email',
    tokens: [{"old":"/events/:eventId/guests/:guestId/card/email","type":0,"val":"events","end":""},{"old":"/events/:eventId/guests/:guestId/card/email","type":1,"val":"eventId","end":""},{"old":"/events/:eventId/guests/:guestId/card/email","type":0,"val":"guests","end":""},{"old":"/events/:eventId/guests/:guestId/card/email","type":1,"val":"guestId","end":""},{"old":"/events/:eventId/guests/:guestId/card/email","type":0,"val":"card","end":""},{"old":"/events/:eventId/guests/:guestId/card/email","type":0,"val":"email","end":""}],
    types: placeholder as Registry['cards.email']['types'],
  },
  'email_settings.edit': {
    methods: ["GET","HEAD"],
    pattern: '/settings/email',
    tokens: [{"old":"/settings/email","type":0,"val":"settings","end":""},{"old":"/settings/email","type":0,"val":"email","end":""}],
    types: placeholder as Registry['email_settings.edit']['types'],
  },
  'email_settings.update': {
    methods: ["PUT"],
    pattern: '/settings/email',
    tokens: [{"old":"/settings/email","type":0,"val":"settings","end":""},{"old":"/settings/email","type":0,"val":"email","end":""}],
    types: placeholder as Registry['email_settings.update']['types'],
  },
  'email_settings.test': {
    methods: ["POST"],
    pattern: '/settings/email/test',
    tokens: [{"old":"/settings/email/test","type":0,"val":"settings","end":""},{"old":"/settings/email/test","type":0,"val":"email","end":""},{"old":"/settings/email/test","type":0,"val":"test","end":""}],
    types: placeholder as Registry['email_settings.test']['types'],
  },
  'admin.templates.index': {
    methods: ["GET","HEAD"],
    pattern: '/admin/templates',
    tokens: [{"old":"/admin/templates","type":0,"val":"admin","end":""},{"old":"/admin/templates","type":0,"val":"templates","end":""}],
    types: placeholder as Registry['admin.templates.index']['types'],
  },
  'admin.templates.create': {
    methods: ["GET","HEAD"],
    pattern: '/admin/templates/new',
    tokens: [{"old":"/admin/templates/new","type":0,"val":"admin","end":""},{"old":"/admin/templates/new","type":0,"val":"templates","end":""},{"old":"/admin/templates/new","type":0,"val":"new","end":""}],
    types: placeholder as Registry['admin.templates.create']['types'],
  },
  'admin.templates.store': {
    methods: ["POST"],
    pattern: '/admin/templates',
    tokens: [{"old":"/admin/templates","type":0,"val":"admin","end":""},{"old":"/admin/templates","type":0,"val":"templates","end":""}],
    types: placeholder as Registry['admin.templates.store']['types'],
  },
  'admin.templates.edit': {
    methods: ["GET","HEAD"],
    pattern: '/admin/templates/:id/edit',
    tokens: [{"old":"/admin/templates/:id/edit","type":0,"val":"admin","end":""},{"old":"/admin/templates/:id/edit","type":0,"val":"templates","end":""},{"old":"/admin/templates/:id/edit","type":1,"val":"id","end":""},{"old":"/admin/templates/:id/edit","type":0,"val":"edit","end":""}],
    types: placeholder as Registry['admin.templates.edit']['types'],
  },
  'admin.templates.update': {
    methods: ["PUT"],
    pattern: '/admin/templates/:id',
    tokens: [{"old":"/admin/templates/:id","type":0,"val":"admin","end":""},{"old":"/admin/templates/:id","type":0,"val":"templates","end":""},{"old":"/admin/templates/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.templates.update']['types'],
  },
  'admin.templates.autosave': {
    methods: ["PUT"],
    pattern: '/admin/templates/:id/autosave',
    tokens: [{"old":"/admin/templates/:id/autosave","type":0,"val":"admin","end":""},{"old":"/admin/templates/:id/autosave","type":0,"val":"templates","end":""},{"old":"/admin/templates/:id/autosave","type":1,"val":"id","end":""},{"old":"/admin/templates/:id/autosave","type":0,"val":"autosave","end":""}],
    types: placeholder as Registry['admin.templates.autosave']['types'],
  },
  'admin.templates.publish': {
    methods: ["PUT"],
    pattern: '/admin/templates/:id/publish',
    tokens: [{"old":"/admin/templates/:id/publish","type":0,"val":"admin","end":""},{"old":"/admin/templates/:id/publish","type":0,"val":"templates","end":""},{"old":"/admin/templates/:id/publish","type":1,"val":"id","end":""},{"old":"/admin/templates/:id/publish","type":0,"val":"publish","end":""}],
    types: placeholder as Registry['admin.templates.publish']['types'],
  },
  'admin.templates.destroy': {
    methods: ["DELETE"],
    pattern: '/admin/templates/:id',
    tokens: [{"old":"/admin/templates/:id","type":0,"val":"admin","end":""},{"old":"/admin/templates/:id","type":0,"val":"templates","end":""},{"old":"/admin/templates/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.templates.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
