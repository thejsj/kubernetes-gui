'use strict'
const joi = require('joi')

const BaseObject = require('./base')
const _name_ = BaseObject.symbols._name_
const _transformer_ = BaseObject.symbols._transformer_
const Transformers = require('../transformers')

const serviceTransformerSchema = joi.object({
  name: joi.string().required(),
  namespace: joi.string().required(),
  labels: joi.object(),
  selector: joi.object(),
  ports: joi.array().required(),
  externalIPs: joi.array()
})

module.exports = class Service extends BaseObject {

  static [_name_] () {
    return 'Service'
  }

  static [_transformer_] (payload) {
    return Service.validatePreTransform(payload, serviceTransformerSchema)
    .then(() => Transformers.service(payload))
  }

}
