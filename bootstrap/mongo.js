const mongoClient   = require('mongodb').MongoClient,
      mongoConfig   = require('../app-config').get('/mongodb'),
      logger        = require('../src/utils/logger');

let [mongo, db]     = [null, null]
const connectMongo  = async () => {
    const mongoURI  = mongoConfig.url, dbName = mongoConfig.db;
    mongo           = await mongoClient.connect(mongoURI, {useNewUrlParser: true})
    db              = mongo.db(dbName)
    logger.info(`Captain America (Mongo DB) connected`)
    return true
}

module.exports = {connectMongo, db}