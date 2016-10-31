'use strict'

const db = require('database')
const bookshelf = require('bookshelf')(db)
bookshelf.plugin('registry')
module.exports = bookshelf
