'use strict'

const bunyan = require('bunyan')
require('loadenv')()

module.exports = bunyan.createLogger({ name: process.env.APP_NAME, level: process.env.LOG_LEVEL_STDOUT })
