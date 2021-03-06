/* eslint-disable no-unused-expressions */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
require('dotenv').config()

const ssl = process.env.SSL === 'true' ? { required: true, rejectUnauthorized: false } : false

const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  dialect: 'postgres',
  ssl: process.env.SSL === 'true',
  dialectOptions: {
    ssl,
  },
})

// Load each model file
const models = Object.assign(
  {},
  ...fs
    .readdirSync(__dirname)
    .filter((file) => file.indexOf('.') !== 0 && file !== 'index.js')
    .map(function (file) {
      const model = require(path.join(__dirname, file))
      return {
        [model.name]: model.init(sequelize),
      }
    })
)

// Load model associations
for (const model of Object.keys(models)) {
  typeof models[model].associate === 'function' && models[model].associate(models)
}

sequelize.sync({ force: process.env.MIGRATE !== 'false' })
module.exports = models
