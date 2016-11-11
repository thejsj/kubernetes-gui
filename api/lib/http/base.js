'use strict'
const log = require('util/log')
const joi = require('util/joi')

const express = require('express')

module.exports = class BaseRouter {

  static validateRequest (req, schema) {
    return joi.validateAsync(req, schema, { 'stripUnknown': true })
    .tap(res => {
      log.trace({ res }, 'validatedReq')
    })
    .catch(err => {
      log.trace({ error: err.toString() }, 'validatedReq error')
      throw new Error(`Validation Error: ${err.toString()}`)
    })
  }

  static responseHandler (req, res, routerResult) {
    log.trace({ routerResult }, 'responseHandler')
    return res.status(200).json(routerResult)
  }

  static errorHandler (req, res, err) {
    log.trace({ message: err.toString(), err }, 'errorHandler')
    // TODO: Add better error handling
    return res.status(400).json({ error: err.toString() })
  }

  static buildRoute(func, schema) {
    return (req, res) => {
      return this.validateRequest(req, schema)
        .then(validatedReq => func(validatedReq))
        .then(this.responseHandler.bind(this, req, res))
        .catch(err => this.errorHandler(req, res, err))
    }
  }

  static getRouter () {
    const router = express.Router()
    this.setRoutes(router)
    return router
  }

}
