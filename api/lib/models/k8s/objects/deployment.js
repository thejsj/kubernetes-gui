'use strict'
const joi = require ('joi')
const debug = require('debug')('k8s:objects:deployment')

const BaseObject = require('./base')
const _name_ = BaseObject.symbols._name_
const _version_ = BaseObject.symbols._version_
const getUrl = BaseObject.symbols.getUrl
const _transformer_ = BaseObject.symbols._transformer_
const _urlName_ = BaseObject.symbols._urlName_
const Transformers = require('../transformers')

const deploymentSchema = joi.object({
  name: joi.string().required(),
  namespace: joi.string().required(),
  labels: joi.object(),
  replicas: joi.number(),
  image: joi.string().required(),
  containerPort: joi.number()
})

module.exports = class Deployment extends BaseObject {

  static [_name_] () {
    return 'Deployment'
  }

  static [_version_] () {
    return 'extensions/v1beta1'
  }

  static [getUrl] ({ namespace }) {
    const url = `http://${process.env.KUBERNETES_API_PROXY_URL}/apis/${this[_version_]()}/namespaces/${namespace}/${this[_urlName_]()}`
    debug('getUrl %s', url)
    return url
  }

  static [_transformer_] (payload) {
    return Deployment.validatePreTransform(payload, deploymentSchema)
    .then(() => {
      debug(`:transformer payload %s`, JSON.stringify(payload))
      return Transformers.deployment(payload)
    })
    .tap(payload => {
      debug(`:transformer transformed payload %s`, JSON.stringify(payload))
    })
  }

}
