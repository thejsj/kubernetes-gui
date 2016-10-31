'use strict'

const Promise = require('bluebird')
const request = require('request')

const headers = {
  'Authorization': `Bearer ${process.env.KUBERNETES_API_TOKEN}`
}

module.exports = class K8s {

  static errorHandler (err) {
    console.log('ERror k8s api', err)
    throw err
  }

  static responseHandler (res) {
    if (typeof res.body === 'string') {
      let response = { err: res.body }
      try {
        response = JSON.parse(res.body)
      } catch (err) {}
      return response
    }
    return res.body
  }

  static getPods () {
    return Promise.fromCallback(cb => {
      request.get(`http://${process.env.KUBERNETES_API_PROXY_URL}/api/v1/pod`, cb)
    })
    .then(K8s.responseHandler)
    .catch(K8s.errorHandler)
  }

  static createReplicationController ({ name, namespace, labels, image, containerPort }) {
    namespace = namespace || 'default'
    containerPort = containerPort || 80
    const json = {
      kind: 'ReplicationController',
      apiVersion: 'v1',
      metadata:{
        name,
        namespace,
        labels: { name }
      },
      spec: {
        replicas: 1,
        template: {
          metadata:{
            name,
            namespace: namespace,
            labels: { name }
          },
          spec: {
            containers: [{
              name,
              image,
              ports: [{ containerPort }],
              resources: {
                limits: {
                  memory: '128Mi',
                  cpu: '500m'
                }
              }
            }]
          }
        }
      }
    }
    const url = `http://${process.env.KUBERNETES_API_PROXY_URL}/api/v1/namespaces/${namespace}/replicationcontrollers`
    return Promise.fromCallback(cb => {
      request({
        url,
        headers,
        method: 'POST',
        json
      }, cb)
    })
    .then(K8s.responseHandler)
    .catch(K8s.errorHandler)
  }

  static createPod ({ name, namespace, labels, image, containerPort }) {
    namespace = namespace || 'default'
    containerPort = containerPort || 80
    const json = {
      kind: 'Pod',
      apiVersion: 'v1',
      metadata:{
        name,
        namespace: namespace,
        labels: { name }
      },
      spec: {
        containers: [{
          name,
          image,
          ports: [{ containerPort }],
          resources: {
            limits: {
              memory: '128Mi',
              cpu: '500m'
            }
          }
        }]
      }
    }
    const url = `http://${process.env.KUBERNETES_API_PROXY_URL}/api/v1/namespaces/${namespace}/pods`
    return Promise.fromCallback(cb => {
      request({
        url,
        headers,
        method: 'POST',
        json
      }, cb)
    })
    .then(K8s.responseHandler)
    .catch(K8s.errorHandler)
  }


  static createService ({ name, namespace, selector, port, targetPort }) {
    port = port || 80
    targetPort = targetPort || 7777
    namespace = namespace || 'default'
    const json = {
      kind: 'Service',
      apiVersion: 'v1',
      metadata: { name, namespace },
      spec: {
        selector,
        ports: [
          {
            name: 'http',
            protocol: 'TCP',
            port,
            targetPort
          }
        ],
        externalIPs : ['80.11.12.10', '192.168.64.6']
      }
    }
    const url = `http://${process.env.KUBERNETES_API_PROXY_URL}/api/v1/namespaces/${namespace}/services`
    return Promise.fromCallback(cb => {
      request({
        url,
        headers,
        method: 'POST',
        json
      }, cb)
    })
    .then(K8s.responseHandler)
    .then(res => console.log(res))
    .catch(K8s.errorHandler)
  }
}
