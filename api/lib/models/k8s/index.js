'use strict'

const Promise = require('bluebird')
const request = require('request')

const pod = require('./objects/pod')
const replicationController = require('./objects/replication-controller')
const service = require('./objects/service')
const deployment = require('./objects/deployment')

module.exports = {
  deployment,
  pod,
  replicationController,
  service
}
