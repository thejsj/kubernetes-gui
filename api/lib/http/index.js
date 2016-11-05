'use strict'

require('loadenv')()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const buildRouter = require('http/build')
const deploymentRouter = require('http/deployment')

app.use(bodyParser.json())

app.use('/deployment', deploymentRouter.getRouter())
app.use('/build', buildRouter.getRouter())

const healthRoute = function(req, res){
  res.send('Its always sunny in Philadelhpia')
}

app.get('/health', healthRoute)
app.get('/', healthRoute)

app.listen(process.env.HTTP_PORT);
