'use strict'

const BaseObject = require('./base')
const _name_ = BaseObject.symbols._name_
const _transformer_ = BaseObject.symbols._transformer_
const Transformers = require('../transformers')

module.exports = class Pod extends BaseObject {

  static [_name_] () {
    return 'Pod'
  }

  static [_transformer_] (payload) {
    return Transformers.pod(payload)
  }

}
