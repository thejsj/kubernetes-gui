'use strict'
require('loadenv')()

const Promise = require('bluebird')
const express = require('express')
const Docker = require('dockerode')

const router = express.Router()
const Build = require('models/build')

router.post('/', (req, res) => {
  console.log('dockerHost', process.env.DOCKER_HOST)
  const docker = new Docker()
  const imageName = 'super-wow-' + Date.now()
  const registryHost = process.env.KUBERNETES_REGISTRY_URL
  const registry = `http://${registryHost}/`
  let tag
  // TODO: Change name to image
  return new Build().save({
    image_name: imageName
  })
  .then(build => {
    // TODO: Move to a worker
    tag = `${registryHost}/build_${build.id}`
    return Promise.all([ Promise.fromCallback(cb => {
      // TODO: Create method for getting name
      // TODO: Replace with GH repo
      docker.buildImage('hello2.tar.gz', { t: tag }, cb)
    }), build ])
  })
  .spread((response, build) => {
    const progressHandler = message => {
      console.log('progress', message)
      if (message.stream && message.stream.match(/^Step/)) {
        // TODO: Save build logs to Rethink
        console.log(message.stream)
      }
    }
    const finishHandler = messages => {
      console.log('finish', messages)
      const image = docker.getImage(tag)
      // TODO: Change to build method
      console.log('push image', image.name, tag)
      return Promise.fromCallback(cb => image.push({ }, cb, {}))
      .then(ressponse => { // .complete, .statusCode, .statusMessage
        console.log('res', response.complete, response.statusCode)
        docker.modem.followProgress(response, console.log.bind(console, 'DONE Pushing'), console.log);
      })
      .catch(err => {
        console.log('ERR pushing image', err)
      })
    }
    // TODO: Add finish handler to re-add all logs to rethink
    docker.modem.followProgress(response, finishHandler, progressHandler);
    console.log('respond')
    return res.status(202).json({ build: build.toJSON() })
  })
  .catch(err => {
    console.log('ERR', err)
    return res.status(400).json({ err })
  })
})

module.exports = router
