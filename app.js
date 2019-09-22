'use strict';

const Aedes     = require('aedes'),
    ws          = require('websocket-stream'),
    redisMq     = require('mqemitter-redis'),
    config      = require('./config'),
    logger      = require('./src/utils/logger'),
    cassandra   = require('./bootstrap/cassandra'),
    handler     = require('./src/mqtt/handler');

const port      = config.get('/mqttPort'), wsPort = config.get('/websocketPort');
const mq        = redisMq(config.get('/redisPubSub'));

mq.state.on('subConnect', () => logger.info('Flash Subscriber connected'));
mq.state.on('pubConnect', () => logger.info('Flash Publisher connected'));

const aedes     = Aedes({mq});
const server    = require('net').createServer(aedes.handle);
const wsServer  = require('http').createServer();

ws.createServer({server: wsServer}, aedes.handle);

cassandra.connect(async err => {
    if (err)
        return logger.error(err);
    logger.info('Batman (Cassandra) connected');
    await require('./bootstrap/mongo').connectMongo()
    await require('./bootstrap/redis')

    wsServer.listen(wsPort, () => {logger.info('Thor websocket server listening on port', wsPort)});
    server.listen(port, () => logger.info('Thor server listening on port', port));
    
    handler(aedes);
});