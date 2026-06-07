import Event from '#models/event'
import { belongsTo } from '@adonisjs/lucid/orm'
import { CardTemplateSchema } from '#database/schema'
import type { Template } from '@pdfme/common'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class CardTemplate extends CardTemplateSchema {
  @belongsTo(() => Event)
  declare event: BelongsTo<typeof Event>

  /**
   * The stored design is a pdfme Template (basePdf + schemas). The QR field's
   * content is injected per guest at render time (see CardRenderService).
   */
  get template(): Template {
    return this.designJson as Template
  }
}
