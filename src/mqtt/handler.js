'use strict';

const auth          = require('./auth'),
    logger          = require('../utils/logger'),
    userServices    = require('../services/userServices'),
    chatServices    = require('../services/chatServices'),
    constants       = require('../utils/constants'),
    mqttUtils       = require('./utils'),
    topics          = require('./topics');

module.exports =  aedes => {
    auth(aedes);

    aedes.on('client', clientConnected);
    aedes.on('clientDisconnect', clientDisconnected);
    aedes.on('clientError', clientErred);
    aedes.on('keepaliveTimeout', clientTimedOut);
    aedes.on('publish', clientPublished);
    aedes.on('subscribe', clientSubscribed);
    aedes.on('unsubscribe', clientUnsubscribed);
    aedes.on('ack', clientAcknowledged);


    async function clientConnected (client) {
        logger.info('client connected', client.id)
        await userServices.addAsActiveUser(client.id)
        await userServices.updateLastSeen('App Opened',client.id)
    }

    async function clientDisconnected (client) {
        logger.info('client disconnected', client.id)
        await userServices.removeAsActiveUser(client.id)
        await userServices.updateLastSeen('App Closed',client.id)
    }

    function clientErred (client, err) {
        logger.warn('client erred', client.id, err);
    }

    function clientTimedOut (client) {
        logger.warn('client timed out', client.id);
    }

    async function clientPublished (packet, client) {
        if (client) {
            logger.debug('client published', client.id, packet);
            const topicStructure    = packet.topic.split('/');
            if (topicStructure[0] === topics.baseTopics.chat) {
                const senderId      = mqttUtils.getUserIdFromClientId(client.id)
                const conversationType = topicStructure[1]
                chatServices.newMessageReceived(JSON.parse(packet.payload), senderId, conversationType);
            }
        }
    }

    function clientSubscribed (subscriptions, client) {
        logger.info('client subscribed', client.id, subscriptions);
    }

    function clientUnsubscribed (unsubscriptions, client) {
        logger.info('client unsubscribed', client.id, unsubscriptions);
    }

    async function clientAcknowledged (packet, client) {
        try {
            if (client) {
                logger.debug('client acknowledged', client.id, packet)
                if(packet) {
                    packet.payload  = JSON.parse(packet.payload)
                    const senderId  = mqttUtils.getUserIdFromClientId(client.id)
                    const conversationType = packet.payload.conversation_type
                    chatServices.handleMessageAcknowledgement(packet, senderId, conversationType, aedes.publish)
                }
            }
        } catch (err) {
            logger.error(err)
        }
    }
};