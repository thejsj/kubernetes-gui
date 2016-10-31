'use strict'

const Promise = require('bluebird')
const joi = require('util/joi')

const schemas = require('./schemas')
const errors = require('./errors')

module.exports = class Transformers {

  static validate (value, schema) {
    return joi.validateAsync(value, schema, { stripUnknown: true })
    .catch(err => {
      if (err.isJoi) {
        throw new errors.ValidationError(err.message)
      }
      throw err
    })
  }

  static metadata ({ name, namespace, labels }) {
    return {
      name,
      namespace,
      labels: labels || { name }
    }
  }

  static selector({ selector }) {
    return selector
  }

  static servicePort(ports) {
    return ports.map(port => {
      return {
        name: 'http',
        port
      }
    })
  }

  static container ({ name, image, containerPort }) {
    return {
      name,
      image,
      ports: [{ containerPort }]
    }
  }

  static service ({ name, namespace, labels, selector, ports, externalIPs }) {
    const value = {
      metadata: Transformers.metadata({ name, namespace, labels }),
      spec: {
        selector: Transformers.selector({ selector }),
        ports: Transformers.servicePort(ports),
        externalIPs
      }
    }
    return Transformers.validate(value, schemas.service)
  }

  static pod ({ name, namespace, labels, image, containerPort }) {
    const value = {
      metadata: Transformers.metadata({ name, namespace, labels }),
      spec: {
        containers: [Transformers.container({ name, image, containerPort })]
      }
    }
    return Transformers.validate(value, schemas.pod)

  }

  static replicationController ({ name, namespace, labels, replicas, image, containerPort }) {
    const value = {
      metadata: Transformers.metadata({ name, namespace, labels }),
      spec: {
        replicas,
        template: {
          metadata: Transformers.metadata({ name, namespace }),
          spec: {
            containers: [Transformers.container({ name, image, containerPort })]
          }
        }
      }
    }
    return Transformers.validate(value, schemas.replicationController)
  }

}
