'use strict'
require('loadenv')()

const Promise = require('bluebird')
const express = require('express')
const joi = require('util/joi')

const router = express.Router()
const k8s = require('models/k8s')
const log = require('util/log')
const BaseRouter = require('http/base')
const Build = require('models/build')

const getSchema = joi.object({}).unknown()

const postSchema = joi.object({
  body: joi.object({
    build: joi.object({
      id: joi.number().required()
    }).unknown().required(),
    // TODO: Default should be exposed ports in container
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
    const buildId = validatedReq.body.build.id
    log.info({ validatedReq }, 'Create replication controller')
    const name = `build-${buildId}`
    return Build.where({ id: buildId }).fetch()
    .then(build => {
      log.trace({ build: build.toJSON() }, 'Build found')
      return k8s.replicationController.create({
        name,
        image: build.get('image_name'),
        containerPort: validatedReq.body.port
      })
    })
    .then(replicationController => {
      const opts = {
        name: `${name}-service`,
        selector: { name },
        ports: [ { port: 6767, targetPort: validatedReq.body.port } ],
        externalIPs: [process.env.DOCKER_HOST_IP]
      }
      log.trace({ replicationController, opts }, 'Replication controller created. Create service')
      return k8s.service.create(opts)
      .then(service => {
        log.trace({ service }, 'RC and service created.')
        return { replicationController, service }
      })
    })
  }

}
