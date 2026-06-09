/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['home']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['home']>>>
    }
  }
  'pages.robots': {
    methods: ["GET","HEAD"]
    pattern: '/robots.txt'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['robots']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['robots']>>>
    }
  }
  'pages.sitemap': {
    methods: ["GET","HEAD"]
    pattern: '/sitemap.xml'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['sitemap']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/pages_controller').default['sitemap']>>>
    }
  }
  'invite.show': {
    methods: ["GET","HEAD"]
    pattern: '/i/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invite_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invite_controller').default['show']>>>
    }
  }
  'invite.card': {
    methods: ["GET","HEAD"]
    pattern: '/i/:token/card'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invite_controller').default['card']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invite_controller').default['card']>>>
    }
  }
  'invite.rsvp': {
    methods: ["POST"]
    pattern: '/i/:token/rsvp'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/guest').rsvpValidator)>>
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/guest').rsvpValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invite_controller').default['rsvp']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invite_controller').default['rsvp']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'registrations.show': {
    methods: ["GET","HEAD"]
    pattern: '/r/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/registrations_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/registrations_controller').default['show']>>>
    }
  }
  'registrations.register': {
    methods: ["POST"]
    pattern: '/r/:token'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/registration').publicRegisterValidator)>>
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/registration').publicRegisterValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/registrations_controller').default['register']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/registrations_controller').default['register']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'public_events.index': {
    methods: ["GET","HEAD"]
    pattern: '/events'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/public_events_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/public_events_controller').default['index']>>>
    }
  }
  'public_events.show': {
    methods: ["GET","HEAD"]
    pattern: '/e/:slug'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/public_events_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/public_events_controller').default['show']>>>
    }
  }
  'public_events.join': {
    methods: ["POST"]
    pattern: '/e/:slug/join'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { slug: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/public_events_controller').default['join']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/public_events_controller').default['join']>>>
    }
  }
  'new_account.create': {
    methods: ["GET","HEAD"]
    pattern: '/signup'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
    }
  }
  'new_account.store': {
    methods: ["POST"]
    pattern: '/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'session.create': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
    }
  }
  'session.store': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>>
    }
  }
  'session.google': {
    methods: ["POST"]
    pattern: '/auth/google'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['google']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['google']>>>
    }
  }
  'session.destroy': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
    }
  }
  'dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['index']>>>
    }
  }
  'events.create': {
    methods: ["GET","HEAD"]
    pattern: '/events/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/events_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/events_controller').default['create']>>>
    }
  }
  'events.store': {
    methods: ["POST"]
    pattern: '/events'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/event').createEventValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/event').createEventValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/events_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/events_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'events.show': {
    methods: ["GET","HEAD"]
    pattern: '/events/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/events_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/events_controller').default['show']>>>
    }
  }
  'events.edit': {
    methods: ["GET","HEAD"]
    pattern: '/events/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/events_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/events_controller').default['edit']>>>
    }
  }
  'events.settings': {
    methods: ["GET","HEAD"]
    pattern: '/events/:id/settings'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/events_controller').default['settings']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/events_controller').default['settings']>>>
    }
  }
  'events.updateSettings': {
    methods: ["PUT"]
    pattern: '/events/:id/settings'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/event').eventSettingsValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/event').eventSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/events_controller').default['updateSettings']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/events_controller').default['updateSettings']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'events.update': {
    methods: ["PUT"]
    pattern: '/events/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/event').updateEventValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/event').updateEventValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/events_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/events_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'events.destroy': {
    methods: ["DELETE"]
    pattern: '/events/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/events_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/events_controller').default['destroy']>>>
    }
  }
  'guests.store': {
    methods: ["POST"]
    pattern: '/events/:eventId/guests'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/guest').createGuestValidator)>>
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/guest').createGuestValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/guests_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/guests_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'guests.bulk': {
    methods: ["POST"]
    pattern: '/events/:eventId/guests/bulk'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/guest').bulkGuestsValidator)>>
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/guest').bulkGuestsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/guests_controller').default['bulkStore']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/guests_controller').default['bulkStore']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'guests.update': {
    methods: ["PUT"]
    pattern: '/events/:eventId/guests/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/guest').updateGuestValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { eventId: ParamValue; id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/guest').updateGuestValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/guests_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/guests_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'guests.destroy': {
    methods: ["DELETE"]
    pattern: '/events/:eventId/guests/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { eventId: ParamValue; id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/guests_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/guests_controller').default['destroy']>>>
    }
  }
  'registration_links.store': {
    methods: ["POST"]
    pattern: '/events/:eventId/registration-link'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/registration').registrationLinkValidator)>>
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/registration').registrationLinkValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/registration_links_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/registration_links_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'registration_links.destroy': {
    methods: ["DELETE"]
    pattern: '/events/:eventId/registration-link'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/registration_links_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/registration_links_controller').default['destroy']>>>
    }
  }
  'invitations.email': {
    methods: ["POST"]
    pattern: '/events/:eventId/guests/:guestId/email'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { eventId: ParamValue; guestId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invitations_controller').default['email']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invitations_controller').default['email']>>>
    }
  }
  'invitations.emailAll': {
    methods: ["POST"]
    pattern: '/events/:eventId/invitations/email-all'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/invitations_controller').default['emailAll']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/invitations_controller').default['emailAll']>>>
    }
  }
  'checkins.scan': {
    methods: ["GET","HEAD"]
    pattern: '/events/:eventId/scan'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/check_ins_controller').default['scan']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/check_ins_controller').default['scan']>>>
    }
  }
  'checkins.verify': {
    methods: ["POST"]
    pattern: '/events/:eventId/check-in'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/check_ins_controller').default['verify']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/check_ins_controller').default['verify']>>>
    }
  }
  'checkins.manual': {
    methods: ["POST"]
    pattern: '/events/:eventId/guests/:id/check-in'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { eventId: ParamValue; id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/check_ins_controller').default['manual']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/check_ins_controller').default['manual']>>>
    }
  }
  'cards.design': {
    methods: ["GET","HEAD"]
    pattern: '/events/:eventId/card'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/card_controller').default['design']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/card_controller').default['design']>>>
    }
  }
  'cards.save': {
    methods: ["PUT"]
    pattern: '/events/:eventId/card'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/card_controller').default['save']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/card_controller').default['save']>>>
    }
  }
  'cards.autosave': {
    methods: ["PUT"]
    pattern: '/events/:eventId/card/autosave'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { eventId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/card_controller').default['autosave']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/card_controller').default['autosave']>>>
    }
  }
  'cards.generate': {
    methods: ["GET","HEAD"]
    pattern: '/events/:eventId/guests/:guestId/card.pdf'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { eventId: ParamValue; guestId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/card_controller').default['generate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/card_controller').default['generate']>>>
    }
  }
  'cards.email': {
    methods: ["POST"]
    pattern: '/events/:eventId/guests/:guestId/card/email'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { eventId: ParamValue; guestId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/card_controller').default['emailCard']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/card_controller').default['emailCard']>>>
    }
  }
  'email_settings.edit': {
    methods: ["GET","HEAD"]
    pattern: '/settings/email'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/email_settings_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/email_settings_controller').default['edit']>>>
    }
  }
  'email_settings.update': {
    methods: ["PUT"]
    pattern: '/settings/email'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/email_setting').emailSettingValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/email_setting').emailSettingValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/email_settings_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/email_settings_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'email_settings.test': {
    methods: ["POST"]
    pattern: '/settings/email/test'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/email_settings_controller').default['test']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/email_settings_controller').default['test']>>>
    }
  }
  'admin.templates.index': {
    methods: ["GET","HEAD"]
    pattern: '/admin/templates'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_templates_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_templates_controller').default['index']>>>
    }
  }
  'admin.templates.create': {
    methods: ["GET","HEAD"]
    pattern: '/admin/templates/new'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_templates_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_templates_controller').default['create']>>>
    }
  }
  'admin.templates.store': {
    methods: ["POST"]
    pattern: '/admin/templates'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/template_preset').createTemplatePresetValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/template_preset').createTemplatePresetValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_templates_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_templates_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.templates.edit': {
    methods: ["GET","HEAD"]
    pattern: '/admin/templates/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_templates_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_templates_controller').default['edit']>>>
    }
  }
  'admin.templates.update': {
    methods: ["PUT"]
    pattern: '/admin/templates/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/template_preset').updateTemplatePresetValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/template_preset').updateTemplatePresetValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_templates_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_templates_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.templates.autosave': {
    methods: ["PUT"]
    pattern: '/admin/templates/:id/autosave'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_templates_controller').default['autosave']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_templates_controller').default['autosave']>>>
    }
  }
  'admin.templates.publish': {
    methods: ["PUT"]
    pattern: '/admin/templates/:id/publish'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_templates_controller').default['togglePublish']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_templates_controller').default['togglePublish']>>>
    }
  }
  'admin.templates.destroy': {
    methods: ["DELETE"]
    pattern: '/admin/templates/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_templates_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_templates_controller').default['destroy']>>>
    }
  }
}
