import { DateTime } from 'luxon'
import Event from '#models/event'
import { RegistrationLinkSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

/**
 * A single public, shareable registration link per event. Anyone with the link
 * can self-register as a guest (until it's disabled or expires) — unlike an
 * Invitation, which is bound to one specific guest.
 */
export default class RegistrationLink extends RegistrationLinkSchema {
  @belongsTo(() => Event)
  declare event: BelongsTo<typeof Event>

  get isExpired() {
    return this.expiresAt !== null && this.expiresAt <= DateTime.now()
  }

  /**
   * Whether the link currently accepts registrations.
   */
  get isUsable() {
    return this.isActive && !this.isExpired
  }
}
