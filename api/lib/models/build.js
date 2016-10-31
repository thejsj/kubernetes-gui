'use strict'

const bookshelf = require('models/index')

module.exports = bookshelf.Model.extend({
  tableName: 'builds'
})
