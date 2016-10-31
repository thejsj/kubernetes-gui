'use strict'

const BaseObject = require('./base')
const _name_ = BaseObject.symbols._name_
const _transformer_ = BaseObject.symbols._transformer_
const Transformers = require('../transformers')

module.exports = class ReplicationController extends BaseObject {

  static [_name_] () {
    return 'ReplicationController'
  }

  static [_transformer_] (payload) {
    return Transformers.replicationController(payload)
  }

}
