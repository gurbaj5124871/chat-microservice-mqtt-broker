const Promise           = require('bluebird'),
    redis               = require('redis'),
    logger              = require('../src/utils/logger'),
    config              = require('../app-config');

Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)

if(process.env.redisDebug == true)
redis.debug_mode         = true;

const url                = config.get('/redis');
const redisClient        = redis.createClient({
    url,
    connect : opts => {
        if (opts.error && opts.error.code === 'ECONNREFUSED') {
            return rej(new Error('The server refused the connection'))
        }
    }
})

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