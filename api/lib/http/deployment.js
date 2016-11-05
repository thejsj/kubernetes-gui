'use strict'
require('loadenv')()

const Promise = require('bluebird')
const express = require('express')

const router = express.Router()
const k8s = require('models/k8s')
const log = require('util/log')

router.get('/', (req, res) => {
  log.info('Get all pods')
  return k8s.pods.getAll()
  .then(response => {
    log.trace({ response  }, 'Get all pods response')
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
})

router.post('/', (req, res) => {
  // TODO: Switch this to a  `deployment` once API is updated
  const name = 'test--wwwwwooooo----name-' + Date.now()
  log.info({ body: req.body }, 'Create replication controller')
  return k8s.replicationController.create({
    name,
    image: 'localhost:5000/build_66',
    containerPort: 80
  })
  .then(replicationController => {
    const opts = { name: `${name}-service`, selector: { name }, ports: [ { port: 6767, targetPort: 80 } ] }
    log.trace({ replicationController, opts }, 'Replication controller created. Create service')
    return k8s.service.create(opts)
    .then(service => {
      log.trace({ service }, 'RC and service created.')
      return res.json({ replicationController, service })
    })
  })
})

module.exports = router
