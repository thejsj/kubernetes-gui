'use strict'
require('loadenv')()

const Promise = require('bluebird')
const express = require('express')

const router = express.Router()
const k8s = require('models/k8s')

router.get('/', (req, res) => {
  return k8s.getPods()
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
  return k8s.createReplicationController({
    name,
    image: 'localhost:5000/build_66'
  })
  .tap(() => {
    return k8s.createService({ name: `${name}-service`, selector: { name }, targetPort: 80, port: 6767 })
  })
  .then(response => {
    return res.json(response)
  })
})

module.exports = router
