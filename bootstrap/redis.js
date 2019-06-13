const Promise           = require('bluebird'),
    redis               = require('ioredis'),
    logger              = require('../src/utils/logger'),
    config              = require('../config');

redis.Promise           = Promise

if(process.env.redisDebug == true)
redis.debug_mode        = true;

const redisClient       = new redis(config.get('/redis'))

redisClient.on('connect', () => {
    logger.info(`Flash (redis) connected`)
})

redisClient.on('error', err => {
    logger.error('Redis Error ' + err)
})

redisClient.on('end', err => {
    logger.warn('Redis Error ' + err)
    // set triggers
})

exports.redisClient = redisClient