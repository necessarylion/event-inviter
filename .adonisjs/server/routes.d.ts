import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'pages.robots': { paramsTuple?: []; params?: {} }
    'pages.sitemap': { paramsTuple?: []; params?: {} }
    'invite.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'invite.card': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'invite.rsvp': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'registrations.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'registrations.register': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'public_events.index': { paramsTuple?: []; params?: {} }
    'public_events.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'public_events.join': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.google': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'events.create': { paramsTuple?: []; params?: {} }
    'events.store': { paramsTuple?: []; params?: {} }
    'events.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'events.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'events.settings': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'events.updateSettings': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'events.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'events.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'guests.store': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'guests.bulk': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'guests.update': { paramsTuple: [ParamValue,ParamValue]; params: {'eventId': ParamValue,'id': ParamValue} }
    'guests.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'eventId': ParamValue,'id': ParamValue} }
    'registration_links.store': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'registration_links.destroy': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'invitations.email': { paramsTuple: [ParamValue,ParamValue]; params: {'eventId': ParamValue,'guestId': ParamValue} }
    'invitations.emailAll': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'checkins.scan': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'checkins.verify': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'checkins.manual': { paramsTuple: [ParamValue,ParamValue]; params: {'eventId': ParamValue,'id': ParamValue} }
    'cards.design': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'cards.save': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'cards.autosave': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'cards.generate': { paramsTuple: [ParamValue,ParamValue]; params: {'eventId': ParamValue,'guestId': ParamValue} }
    'cards.email': { paramsTuple: [ParamValue,ParamValue]; params: {'eventId': ParamValue,'guestId': ParamValue} }
    'email_settings.edit': { paramsTuple?: []; params?: {} }
    'email_settings.update': { paramsTuple?: []; params?: {} }
    'email_settings.test': { paramsTuple?: []; params?: {} }
    'admin.templates.index': { paramsTuple?: []; params?: {} }
    'admin.templates.create': { paramsTuple?: []; params?: {} }
    'admin.templates.store': { paramsTuple?: []; params?: {} }
    'admin.templates.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.templates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.templates.autosave': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.templates.publish': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.templates.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'pages.robots': { paramsTuple?: []; params?: {} }
    'pages.sitemap': { paramsTuple?: []; params?: {} }
    'invite.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'invite.card': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'registrations.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'public_events.index': { paramsTuple?: []; params?: {} }
    'public_events.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'events.create': { paramsTuple?: []; params?: {} }
    'events.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'events.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'events.settings': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'checkins.scan': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'cards.design': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'cards.generate': { paramsTuple: [ParamValue,ParamValue]; params: {'eventId': ParamValue,'guestId': ParamValue} }
    'email_settings.edit': { paramsTuple?: []; params?: {} }
    'admin.templates.index': { paramsTuple?: []; params?: {} }
    'admin.templates.create': { paramsTuple?: []; params?: {} }
    'admin.templates.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'pages.robots': { paramsTuple?: []; params?: {} }
    'pages.sitemap': { paramsTuple?: []; params?: {} }
    'invite.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'invite.card': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'registrations.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'public_events.index': { paramsTuple?: []; params?: {} }
    'public_events.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'events.create': { paramsTuple?: []; params?: {} }
    'events.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'events.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'events.settings': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'checkins.scan': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'cards.design': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'cards.generate': { paramsTuple: [ParamValue,ParamValue]; params: {'eventId': ParamValue,'guestId': ParamValue} }
    'email_settings.edit': { paramsTuple?: []; params?: {} }
    'admin.templates.index': { paramsTuple?: []; params?: {} }
    'admin.templates.create': { paramsTuple?: []; params?: {} }
    'admin.templates.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'invite.rsvp': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'registrations.register': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'public_events.join': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.google': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'events.store': { paramsTuple?: []; params?: {} }
    'guests.store': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'guests.bulk': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'registration_links.store': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'invitations.email': { paramsTuple: [ParamValue,ParamValue]; params: {'eventId': ParamValue,'guestId': ParamValue} }
    'invitations.emailAll': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'checkins.verify': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'checkins.manual': { paramsTuple: [ParamValue,ParamValue]; params: {'eventId': ParamValue,'id': ParamValue} }
    'cards.email': { paramsTuple: [ParamValue,ParamValue]; params: {'eventId': ParamValue,'guestId': ParamValue} }
    'email_settings.test': { paramsTuple?: []; params?: {} }
    'admin.templates.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'events.updateSettings': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'events.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'guests.update': { paramsTuple: [ParamValue,ParamValue]; params: {'eventId': ParamValue,'id': ParamValue} }
    'cards.save': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'cards.autosave': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'email_settings.update': { paramsTuple?: []; params?: {} }
    'admin.templates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.templates.autosave': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.templates.publish': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'events.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'guests.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'eventId': ParamValue,'id': ParamValue} }
    'registration_links.destroy': { paramsTuple: [ParamValue]; params: {'eventId': ParamValue} }
    'admin.templates.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}