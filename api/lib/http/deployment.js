'use strict'
require('loadenv')()

const Promise = require('bluebird')
const express = require('express')
const joi = require('util/joi')

const router = express.Router()
const k8s = require('models/k8s')
const log = require('util/log')
const BaseRouter = require('http/base')

const getSchema = joi.object({}).unknown()

const postSchema = joi.object({
  body: joi.object({
    name: joi.string().required(),
    image: joi.string().required(),
    port: joi.number().default(80)
  }).required().unknown()
}).unknown()

module.exports = class DeploymentRouter extends BaseRouter {

  static setRoutes (router) {
    router.get('/', this.buildRoute(this.get, getSchema))
    router.post('/', this.buildRoute(this.post, postSchema))
    return router
  }

  static get (validatedReq) {
   log.info('Get all pods')
    return k8s.pods.getAll()
    .then(response => {
      log.trace({ response }, 'Get all pods response')
      const pods = response.pods
        .filter(x => x.objectMeta.namespace === 'default')
        .map(x => { return {
          name: x.objectMeta.name,
          phase: x.podPhase,
          ip: x.podIp
        }})
      log.trace({ pods }, 'Get all pods response - mapped')
      return res.json(pods)
    })
  }

  static post (validatedReq) {
    // TODO: Switch this to a  `deployment` once API is updated
    const name = validatedReq.body.name
    log.info({ validatedReq }, 'Create replication controller')
    return k8s.replicationController.create({
      name,
      image: validatedReq.body.image,
      containerPort: validatedReq.body.port
    })
    .then(replicationController => {
      const opts = { name: `${name}-service`, selector: { name }, ports: [ { port: 6767, targetPort: validatedReq.body.port } ] }
      log.trace({ replicationController, opts }, 'Replication controller created. Create service')
      return k8s.service.create(opts)
      .then(service => {
        log.trace({ service }, 'RC and service created.')
        return { replicationController, service }
      })
    })
  }

}
