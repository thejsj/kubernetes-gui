'use strict'
require('loadenv')()

const Promise = require('bluebird')
const express = require('express')
const Docker = require('dockerode')
const joi = require('joi')

const router = express.Router()
const Build = require('models/build')
const log = require('util/log')
const BaseRouter = require('http/base')

const postSchema = joi.object({
  body: joi.object({
  }).required()
}).unknown()

module.exports = class BuildRouter extends BaseRouter {

  static setRoutes (router) {
    router.post('/', this.buildRoute(this.post, postSchema))
    return router
  }

  static post (validatedReq) {
    log.info({ validatedReq }, 'Creating build')
    const docker = new Docker()
    const registryHost = process.env.KUBERNETES_REGISTRY_URL
    const registry = `http://${registryHost}/`
    let tag
    // TODO: Change name to image
    log.info({ registry, registryHost }, 'Saving build')
    return new Build().save()
    .then(build => {
      // TODO: Move to a worker
      tag = `${registryHost}/build_${build.id}`
      log.trace({ build: build.toJSON(), tag }, 'Build created. Bulding imaged')
      return Promise.all([ Promise.fromCallback(cb => {
        // TODO: Create method for getting name
        // TODO: Replace with GH repo
        docker.buildImage('hello2.tar.gz', { t: tag }, cb)
      }), build ])
    })
    .spread((response, build) => {
      log.trace({ statusCode: response.statusCode, build: build.id }, 'Image build request sent. Listening to progres...')
      const progressHandler = message => {
        if (message.stream && message.stream.match(/^Step/)) {
          // TODO: Save build logs to Rethink
          log.trace({ message: message.stream, build: build.id }, 'Image building experience')
        }
      }
      const finishHandler = messages => {
        const image = docker.getImage(tag)
        // TODO: Change to build method
        log.trace({ messages, build: build.id, tag, image: image.name }, 'Image building finished. Pushing image...')
        return Promise.fromCallback(cb => image.push({ }, cb, {}))
        .then(response => { // .complete, .statusCode, .statusMessage
          log.trace({ build: build.id, tag, image: image.name, statusCode: response.statusCode }, 'Image push started')
          docker.modem.followProgress(response, () => {
            log.trace({ messages, build: build.id, tag, image: image.name }, 'Image pushed')
          })
        })
        .catch(err => {
          log.error({ err, build: build.id, tag, image: image.name }, 'Image push failed.')
        })
      }
      // TODO: Add finish handler to re-add all logs to rethink
      docker.modem.followProgress(response, finishHandler, progressHandler);
      log.trace({ build: build.toJSON() }, 'Returning build response.')
      // return res.status(202).json({ build: build.toJSON() })
      return build.save({ image_name: tag })
    })
    .then(build => build.toJSON())
    .catch(err => {
      log.error({ err, imageName }, 'Unexpected error while trying to create image')
      // return res.status(400).json({ err })
      throw err
    })
  }

}
