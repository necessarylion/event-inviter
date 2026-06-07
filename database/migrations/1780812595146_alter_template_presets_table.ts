import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'template_presets'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Base64 PNG data URI of the first page, rendered on save for thumbnails.
      table.text('preview_image').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('preview_image')
    })
  }
}
