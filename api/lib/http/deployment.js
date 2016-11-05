'use strict'
require('loadenv')()

const Promise = require('bluebird')
const express = require('express')

const router = express.Router()
const k8s = require('models/k8s')

router.get('/', (req, res) => {
  return k8s.pods.getAll()
  .then(response => {
    const pods = response.pods
      .filter(x => x.objectMeta.namespace === 'default')
      .map(x => { return {
        name: x.objectMeta.name,
        phase: x.podPhase,
        ip: x.podIp
      }})
    return res.json(pods)
  })
})

router.post('/', (req, res) => {
  // TODO: Switch this to a  `deployment` once API is updated
  const name = 'test--wwwwwooooo----name-' + Date.now()
  return k8s.replicationController.create({
    name,
    image: 'localhost:5000/build_66',
    containerPort: 80
  })
  .then(replicationController => {
    return k8s.service.create({ name: `${name}-service`, selector: { name }, ports: [ { port: 6767, targetPort: 80 } ] })
    .then(service => {
      return res.json({ replicationController, service })
    })
  })
})

module.exports = router
