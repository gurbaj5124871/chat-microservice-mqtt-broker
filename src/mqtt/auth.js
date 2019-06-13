'use strict';

const validator     = require('./validator'),
    topics          = require('./topics'),
    utils           = require('./utils'),
    logger          = require('../utils/logger'),
    authentication  = require('../utils/authentication'),
    microservices   = require('./microservices'),
    constants       = require('../utils/constants');

module.exports                  = aedes => {
    aedes.authenticate          = authenticateClient;
    aedes.authorizeSubscribe    = authoriseSubscribe;
    aedes.authorizePublish      = authorisePublish;
    // aedes.authorizeForward = function () {}

    async function authenticateClient (client, username, password, callback) {
        try {
            if(microservices.microservicesConfig.microservices.includes(client.id) === true) {
                password = password.toString()
                const msCreds   = microservices.microservicesConfig[client.id] || {}
                if(msCreds.username !== username || msCreds.password !== password.toString())
                    return callback(null, false)
                else callback(null, true)
            } else {
                const authenticatedClient = await authentication.verifyToken(password.toString());
                const senderId      = utils.getUserIdFromClientId(client.id);
                const clientIdValid = senderId === authenticatedClient.userId && senderId === username;
                const clientActive  = await utils.isClientActive(client.id);
                if (clientIdValid && clientActive)
                    sendDisconnectPublish(client.id);
                callback(null, clientIdValid);
            }
        } catch (err) {
            
            logger.warn(err);
            callback(null, false);
        }
    }

    async function authoriseSubscribe (client, subscription, callback) {
        try {
            const topicStructure= subscription.topic.split('/');
            const topLevelTopic = topicStructure[0]
            if(Object.values(topics.baseTopics).includes(topLevelTopic) === false)
                return unauthorisedSubscribe(client, callback)
            else {
                switch(topLevelTopic) {
                    case topics.baseTopics.chat         : return authChatSubscriptions(client, subscription, callback)
                    case topics.baseTopics.microservice : return authMicroservicesSubscriptions(client, subscription, callback)
                }
            }

            async function authChatSubscriptions(client, subscription, callback) {
                const chatTypeTopic = topicStructure[1]
                if(topics.chatTypeTopics.values().includes(chatTypeTopic) === false) 
                    return unauthorisedSubscribe(client, callback)
                else {
                    if(chatTypeTopic === topics.chatTypeTopics.single && utils.getUserIdFromClientId(client.id) !== topicStructure[2]) 
                        return unauthorisedSubscribe(client, callback)
                    else if (!await utils.doesSubscriberHasTopic(...utils.getPlatformAndUserTypeAndIdFromClientId(client.id), subscription.topic))
                        return unauthorisedSubscribe(client, callback)
                    else callback(null, subscription)
                }
            }

            async function authMicroservicesSubscriptions(client, subscription, callback) {
                const microserviceTopic = topicStructure[1]
                if(microserviceTopic !== client.id)
                    return unauthorisedSubscribe(client, callback)
                else callback(null, subscription)
            }

            function unauthorisedSubscribe(client, callback) {
                logger.warn(client.id + ' Tried to subscribe to unauthorised topic ' + subscription.topic);
                return callback(null, null)
            }
        } catch (err) {
            callback(err);
        }
    }

    async function authorisePublish(client, packet, callback) {
        try {
            callback();
        } catch (err) {
            // if (err.code === 'ERR_ASSERTION')
            //     logger.warn('Expected', err.expected, 'Actual', err.actual);
            callback(err);
        }
    }

    function sendDisconnectPublish (clientId) {
        const {userId, platform}    = userUtil.getPlatformAndUserIdFromClientId(clientId);
        const topic                 = topics.disconnectUser(userId);
        aedes.publish({topic, payload: JSON.stringify({type: 'disconnect', data: {platform}})}, null);
    }
};