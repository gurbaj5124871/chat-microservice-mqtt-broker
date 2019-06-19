'use strict'

const mongoClient   = require('mongodb').MongoClient,
      mongoConfig   = require('../config').get('/mongodb'),
      logger        = require('../src/utils/logger');

const connectMongo  = async () => {
    const mongoURI  = mongoConfig.url, dbName = mongoConfig.db;
    const mongo     = await mongoClient.connect(mongoURI, {useNewUrlParser: true})
    logger.info(`Captain America (Mongo DB) connected`)
    global.mongodb  = mongo.db(dbName)
}

module.exports = {connectMongo}