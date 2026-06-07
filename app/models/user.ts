import env from '#start/env'
import Event from '#models/event'
import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { hasMany } from '@adonisjs/lucid/orm'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  @hasMany(() => Event)
  declare events: HasMany<typeof Event>

  /**
   * Admin access is granted via the `ADMIN_EMAILS` env allowlist (comma-separated),
   * matched case-insensitively — no database column or role table needed.
   */
  get isAdmin(): boolean {
    const allow = (env.get('ADMIN_EMAILS', '') as string)
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
    return allow.includes(this.email.toLowerCase())
  }

  get initials() {
    const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }

    return `${first.slice(0, 2)}`.toUpperCase()
  }
}
