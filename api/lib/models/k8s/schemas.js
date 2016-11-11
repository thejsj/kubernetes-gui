'use strict'
const joi = require('util/joi')

const apiVersionV1 = joi.string().default('v1')
const apiVersionV1Beta = joi.string().default('extensions/v1beta1')
const apiVersion = apiVersionV1

const size = joi.string()
const port = joi.number()

// http://kubernetes.io/docs/api-reference/extensions/v1beta1/definitions/#_v1_objectmeta
const objectMeta = joi.object({
  name: joi.string(),
  generateName: joi.string(),
  namespace: joi.string().default('default'),
  selfLink: joi.string(),
  uid: joi.string(),
  resourceVersion: joi.string(),
  generation: joi.number().integer(),
  creationTimestamp: joi.string(),
  deletionTimestamp: joi.string(),
  deletionGracePeriodSeconds: joi.number().integer(),
  labels: joi.object(),
  annotations: joi.object(),
  // ownerReferences
  finalizers: joi.array().items(joi.string()),
  clusterName: joi.string()
}).label('v1.ObjectMeta')
const metadata = objectMeta

const labelSelectorRequirement = joi.object({
  key: joi.string().required(),
  operator: joi.string().required(),
  values: joi.array().items(joi.string())
}).label('v1beta1.LabelSelectorRequirement')

// http://kubernetes.io/docs/api-reference/extensions/v1beta1/definitions/#_v1beta1_labelselector
const labelSelector = joi.object({
  matchLabels: joi.object(),
  matchExpressions: joi.array().items(labelSelectorRequirement)
}).label('v1beta1.LabelSelector')

const podPortsArray = joi.array().items(joi.object({
  containerPort: joi.number().required()
})).required().label('Pod ports')

const servicePortsArray = joi.array().items(joi.object({
  name: joi.string().default('http'),
  protocol: joi.string().valid(['TCP', 'UDP']).default('TCP'),
  port,
  targetPort: port
})).required().label('Service Ports')

// http://kubernetes.io/docs/api-reference/extensions/v1beta1/definitions/#_v1beta1_rollbackconfig
const rollbackConfig = joi.object({
  revision: joi.number().integer()
}).label('RollbackConfig')

// http://kubernetes.io/docs/api-reference/v1/definitions/#_v1_container
const container = joi.object({
  name: joi.string().required(),
  image: joi.string(),
  command: joi.array().items(joi.string()),
  args: joi.array().items(joi.string()),
  workingDir: joi.array().items(joi.string()),
  ports: podPortsArray
  // TODO: Add missing properties
}).label('v1.PodSpec')

// http://kubernetes.io/docs/api-reference/v1/definitions/#_v1_podspec
const podSpec = joi.object({
  // TODO: Add missing properties
  containers: joi.array().items(container)
}).label('v1.PodSpec')

const serviceSpec = joi.object({
  selector: joi.object().required(),
  ports: servicePortsArray.required(),
  externalIPs: joi.array()
}).label('Service Spec')

// http://kubernetes.io/docs/api-reference/extensions/v1beta1/definitions/#_v1_podtemplatespec
const podTemplateSpec = joi.object({
  metadata,
  spec: podSpec
}).label('v1.PodTemplateSpec')

const replicationControllerSpec = joi.object({
  replicas: joi.number().default(1),
  template: podTemplateSpec
}).label('Replication Controller Spec')

// http://kubernetes.io/docs/api-reference/extensions/v1beta1/definitions/#_v1beta1_deploymentspec
const deploymentSpec = joi.object({
  replicas: joi.number().integer(), // Defaults to 1
  selector: labelSelector,
  template: podTemplateSpec.required(),
  strategy: joi.object(), // TODO: Add spec
  minReadySeconds: joi.number().integer(),
  revisionHistoryLimit: joi.number().integer(),
  paused: joi.boolean(), // Defaults to false
  rollbackTo: rollbackConfig
}).label('v1beta1.DeploymentSpec')

// http://kubernetes.io/docs/api-reference/extensions/v1beta1/definitions/#_v1beta1_deploymentstatus
const deploymentStatus = joi.object({
  observedGeneration: joi.number().integer(),
  replicas: joi.number().integer(),
  updatedReplicas: joi.number().integer(),
  availableReplicas: joi.number().integer(),
  unavailableReplicas: joi.number().integer()
}).label('v1beta1.DeploymentStatus')

module.exports.pod = joi.object({
  kind: joi.string().valid('Pod').default('Pod'),
  apiVersion,
  metadata,
  spec: podSpec
}).label('Pod')

module.exports.service = joi.object({
  kind: joi.string().valid('Service').default('Service'),
  apiVersion,
  metadata,
  spec: serviceSpec
}).label('Serivce')

module.exports.replicationController = joi.object({
  kind: joi.string().valid('ReplicationController').default('ReplicationController'),
  apiVersion,
  metadata,
  spec: replicationControllerSpec
}).label('Replication Controller')

module.exports.deployment = joi.object({
  kind: joi.string().valid('Deployment').default('Deployment'),
  apiVersion: apiVersionV1Beta,
  metadata,
  spec: deploymentSpec,
  status: deploymentStatus
}).label('Deployment')
