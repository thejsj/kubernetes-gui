'use strict'
const joi = require ('joi')

const BaseObject = require('./base')
const _name_ = BaseObject.symbols._name_
const _transformer_ = BaseObject.symbols._transformer_
const Transformers = require('../transformers')

const replicationControllerTransformerSchema = joi.object({
  name: joi.string().required(),
  namespace: joi.string().required(),
  labels: joi.object(),
  replicas: joi.number(),
  image: joi.string().required(),
  containerPort: joi.number()
})

module.exports = class ReplicationController extends BaseObject {

  static [_name_] () {
    return 'ReplicationController'
  }

  static [_transformer_] (payload) {
    return ReplicationController.validatePreTransform(payload, replicationControllerTransformerSchema)
      .then(() => Transformers.replicationController(payload))
  }

}
