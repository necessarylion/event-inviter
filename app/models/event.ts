import User from '#models/user'
import Guest from '#models/guest'
import Invitation from '#models/invitation'
import RegistrationLink from '#models/registration_link'
import { EventSchema } from '#database/schema'
import { belongsTo, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'

export default class Event extends EventSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Guest)
  declare guests: HasMany<typeof Guest>

  @hasMany(() => Invitation)
  declare invitations: HasMany<typeof Invitation>

  @hasOne(() => RegistrationLink)
  declare registrationLink: HasOne<typeof RegistrationLink>
}
