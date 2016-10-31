'use strict'
const joi = require('util/joi')

const apiVersion = joi.string().default('v1')
const size = joi.string()
const port = joi.number()

const metadata = joi.object({
  name: joi.string().required(),
  namespace: joi.string().default('default'),
  labels: joi.object()
}).required()

const podPortsArray = joi.array().items(joi.object({
  containerPort: joi.number().required()
})).required()

const servicePortsArray = joi.array().items(joi.object({
  name: joi.string().default('http'),
  protocol: joi.string().valid(['TCP', 'UDP']).default('TCP'),
  port,
  targetPort: port
})).required()

const podSpec = joi.object({
  name: joi.string().required(),
  image: joi.string().required(),
  ports: podPortsArray.required(),
  resources: joi.object({
    limits: joi.object({
      memory: size,
      cpu: size
    })
  })
})

const serviceSpec = joi.object({
  selector: joi.object().required(),
  ports: servicePortsArray.required(),
  externalIPs: joi.array().items(port)
})

const replicationControllerSpec = joi.object({
  replicas: joi.number().default(1),
  template: joi.object({
    metadata,
    spec: joi.object({
      containers: joi.array().items(podSpec)
    })
  })
})

module.exports.pod = joi.object({
  kind: joi.string().valid('Pod').default('Pod'),
  apiVersion,
  metadata,
  spec: podSpec
})

module.exports.service = joi.object({
  kind: joi.string().valid('Service').default('Service'),
  apiVersion,
  metadata,
  spec: serviceSpec
})

module.exports.replicationController = joi.object({
  kind: joi.string().valid('ReplicationController').default('ReplicationController'),
  apiVersion,
  metadata,
  spec: replicationControllerSpec
})
