'use strict';

const logger = require('../utils/logger'),
    auth = require('./auth');

module.exports =  aedes => {
    auth(aedes);

    aedes.on('client', clientConnected);
    aedes.on('clientDisconnect', clientDisconnected);
    aedes.on('clientError', clientErred);
    aedes.on('keepaliveTimeout', clientTimedOut);
    aedes.on('publish', clientPublished);
    aedes.on('subscribe', clientSubscribed);
    aedes.on('unsubscribe', clientUnsubscribed);
    // aedes.on('ack', function (packet, client) {})

    function clientConnected (client) {
        logger.info('client connected', client.id);

        // //TODO: deprecate
        // if (userUtil.getPlatformFromClientId(client.id) === undefined)
        //     return userHelper.addAsActiveUser(client.id + '-unknown');

        // userHelper.addAsActiveUser(client.id);
    }

    function clientDisconnected (client) {
        logger.info('client disconnected', client.id);

        // //TODO: deprecate
        // if (userUtil.getPlatformFromClientId(client.id) === undefined)
        //     return userHelper.removeAsActiveUser(client.id + '-unknown');

        // userHelper.removeAsActiveUser(client.id);
    }

    function clientErred (client, err) {
        logger.warn('client erred', client.id, err);
    }

    function clientTimedOut (client) {
        logger.warn('client timed out', client.id);
    }

    async function clientPublished (packet, client) {
        if (client !== null) {
            console.log('client published', client.id, packet)
            logger.debug('client published', client.id, packet);
            const topicStructure = packet.topic.split('/');
        }
    }

    function clientSubscribed (subscriptions, client) {
        logger.info('client subscribed', client.id, subscriptions);
    }

    function clientUnsubscribed (unsubscriptions, client) {
        logger.info('client unsubscribed', client.id, unsubscriptions);
    }
};