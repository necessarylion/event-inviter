import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'template_presets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table.string('name').notNullable()
      table.string('description').nullable()
      table.integer('width').notNullable().defaultTo(105)
      table.integer('height').notNullable().defaultTo(148)
      table.jsonb('design_json').notNullable()
      table.boolean('is_published').notNullable().defaultTo(true)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
