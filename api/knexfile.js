'use strict'
require('loadenv')()

module.exports = {
  client: 'pg',
  connection: process.env.POSTGRES_CONNECT_STRING,
  migrations: {
    tableName: 'migrations'
  }
}
