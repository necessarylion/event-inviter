/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  pages: {
    robots: typeof routes['pages.robots']
    sitemap: typeof routes['pages.sitemap']
  }
  invite: {
    show: typeof routes['invite.show']
    rsvp: typeof routes['invite.rsvp']
  }
  newAccount: {
    create: typeof routes['new_account.create']
    store: typeof routes['new_account.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
  dashboard: typeof routes['dashboard']
  events: {
    create: typeof routes['events.create']
    store: typeof routes['events.store']
    show: typeof routes['events.show']
    edit: typeof routes['events.edit']
    update: typeof routes['events.update']
    destroy: typeof routes['events.destroy']
  }
  guests: {
    store: typeof routes['guests.store']
    bulk: typeof routes['guests.bulk']
    update: typeof routes['guests.update']
    destroy: typeof routes['guests.destroy']
  }
  invitations: {
    email: typeof routes['invitations.email']
    emailAll: typeof routes['invitations.emailAll']
  }
  checkins: {
    scan: typeof routes['checkins.scan']
    verify: typeof routes['checkins.verify']
  }
  cards: {
    design: typeof routes['cards.design']
    save: typeof routes['cards.save']
    generate: typeof routes['cards.generate']
    email: typeof routes['cards.email']
  }
  emailSettings: {
    edit: typeof routes['email_settings.edit']
    update: typeof routes['email_settings.update']
    test: typeof routes['email_settings.test']
  }
  admin: {
    templates: {
      index: typeof routes['admin.templates.index']
      create: typeof routes['admin.templates.create']
      store: typeof routes['admin.templates.store']
      edit: typeof routes['admin.templates.edit']
      update: typeof routes['admin.templates.update']
      publish: typeof routes['admin.templates.publish']
      destroy: typeof routes['admin.templates.destroy']
    }
  }
}
