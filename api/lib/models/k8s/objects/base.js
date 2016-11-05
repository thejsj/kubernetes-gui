'use strict'

const Promise = require('bluebird')
const request = require('request')
const joi = require('joi')

const errors = require('../errors')

const _name_ = Symbol('name')
const _urlName_ = Symbol('urlName')
const _version_ = Symbol('version')
const _transformer_ = Symbol('transformer')
const responseHandler = Symbol('responseHanlder')
const errorHandler = Symbol('errorHandler')
const getUrl = Symbol('getUrl')

const headers = {
  'Authorization': `Bearer ${process.env.KUBERNETES_API_TOKEN}`
}

module.exports = class BaseObject {

  static getAll () {
    return Promise.fromCallback(cb => {
      request.get(this[getUrl](), cb)
    })
    .then(BaseObject._responseHandler)
    .catch(BaseObject[errorHandler])
  }

  static create (payload) {
    payload.namespace = payload.namespace || 'default'
    return this[_transformer_](payload)
    .then(json => {
      return Promise.fromCallback(cb => {
        request({
          url: this[getUrl]({ namespace: payload.namespace }),
          headers,
          method: 'POST',
          json
        }, cb)
      })
    })
    .then(BaseObject[responseHandler])
    .catch(BaseObject[errorHandler])
  }

  static delete () {
  }

  static [_transformer_] () {
    throw new ImplementationError('This method must be implemented in every class.')
  }

  static [_name_] () {
    throw new ImplementationError('This method must be implemented in every class.')
  }

  static [_urlName_] () {
    return this[_name_]().toLowerCase() + 's'
  }

  static [_version_] () {
    return 'v1'
  }

  static [errorHandler] (err) {
    throw err
  }

  static [getUrl] ({ namespace }) {
    const url = `http://${process.env.KUBERNETES_API_PROXY_URL}/api/${this[_version_]()}/namespaces/${namespace}/${this[_urlName_]()}`
    console.log(url)
    return url
  }

  static [responseHandler] (res) {
    if (typeof res.body === 'string') {
      let response = { err: res.body }
      try {
        response = JSON.parse(res.body)
      } catch (err) {}
      return response
    }
    return res.body
  }

  static validatePreTransform (value, schema) {
    return joi.validateAsync(value, schema)
    .catch(err => {
      if (err.isJoi) {
        throw new errors.ValidationError(err.message)
      }
      throw err
    })
  }

}

module.exports.symbols = {
  _name_,
  _version_,
  _transformer_
}
