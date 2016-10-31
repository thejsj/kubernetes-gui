'use strict'

exports.up = function (knex, Promise) {
  return knex.schema.createTable('builds', function (table) {
    table.increments()
    table.string('image_name', 255).unique()
    table.string('url', 255).unique()
    table.timestamps()
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('builds')
}
