'use strict'
const Promise = require('bluebird')
module.exports = Promise.promisifyAll(require('joi'))
