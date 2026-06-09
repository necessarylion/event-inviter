import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('thumbnail_url').nullable()
      table.string('map_url').nullable()
      table.boolean('is_public').notNullable().defaultTo(false)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('thumbnail_url')
      table.dropColumn('map_url')
      table.dropColumn('is_public')
    })
  }
}
