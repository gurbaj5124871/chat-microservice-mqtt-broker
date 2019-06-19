'use strict';

const topics        = require('./topics'),
    validator       = require('./validator'),
    utils           = require('./utils'),
    logger          = require('../utils/logger'),
    authentication  = require('../utils/authentication'),
    chatServices    = require('../services/chatServices'),
    constants       = require('../utils/constants');

module.exports                  = aedes => {
    aedes.authenticate          = authenticateClient;
    aedes.authorizeSubscribe    = authoriseSubscribe;
    aedes.authorizePublish      = authorisePublish;
    // aedes.authorizeForward = function () {}

    async function authenticateClient (client, username, password, callback) {
        try {
            const authenticatedClient = await authentication.verifyToken(password.toString());
            const senderId      = utils.getUserIdFromClientId(client.id);
            const clientIdValid = senderId === authenticatedClient.userId && senderId === username;
            const clientActive  = await utils.isClientActive(client.id);
            if (clientIdValid && clientActive)
                sendDisconnectPublish(client.id);
            callback(null, clientIdValid);
        } catch (err) {
            logger.warn(err);
            callback(null, false);
        }
    }

    async function authoriseSubscribe (client, subscription, callback) {
        try {
            const topicStructure= subscription.topic.split('/');
            const topLevelTopic = topicStructure[0]
            switch(topLevelTopic) {
                case topics.baseTopics.chat : return authChatSubscriptions(client, subscription, callback)
                default                     : return unauthorisedSubscribe(client, callback)
            }

            async function authChatSubscriptions(client, subscription, callback) {
                const chatTypeTopic = topicStructure[1]
                if(Object.values(topics.chatTypeTopics).includes(chatTypeTopic) === false) 
                    return unauthorisedSubscribe(client, callback)
                else {
                    const {userType, userId} = utils.getPlatformAndUserTypeAndIdFromClientId(client.id)
                    if(chatTypeTopic === topics.chatTypeTopics.single) {
                        if(userId !== topicStructure[2])
                            return unauthorisedSubscribe(client, callback)
                        else callback(null, subscription)
                    }
                    else if (await utils.doesSubscriberHasTopic(userType, userId, topicStructure[2]))
                        return callback(null, subscription)
                    else unauthorisedSubscribe(client, callback)
                }
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
            const topicStructure    = packet.topic.split('/');
            const chatType          = topicStructure[1]
            const payload           = JSON.parse(packet.payload);
            switch(chatType) {
                case topics.chatTypeTopics.single   : validateSingleChat(payload, topicStructure); break;
                case topics.chatTypeTopics.channel  : validateChannelChat(payload, topicStructure); break;
                case topics.chatTypeTopics.group    : validateGroupChat(payload, topicStructure); break;
                //case topics.chatTypeTopics.campaign : validateCampaignChat(payload); break;
                default                             : throw new Error()
            }
            packet.payload          = JSON.stringify(payload)
            callback();
        } catch (err) {
            logger.warn(err);
            callback(err);
        }

        async function validateSingleChat(payload, topicStructure) {
            const userId = utils.getUserIdFromClientId(client.id), receiverId = topicStructure[2];
            if(userId === receiverId)
                throw new Error(`Cannot publish to itself`)
            const messageTopic      = topicStructure[3]
            switch (messageTopic)   {
                case topics.messageTypeTopics.message   : validator.message(payload); break;
                case topics.messageTypeTopics.block     : validator.block(payload); break;
                default                                 : throw new Error('Invaild message topic')
            }
            if(messageTopic !== topics.messageTypeTopics.block) {
                if(await chatServices.isConversationBlocked(payload, userId))
                    throw new Error(`Conversation Blocked`)
                payload.last_message_time = new Date()
            }
        }
    
        async function validateChannelChat(payload, topicStructure) {
            const userId = utils.getUserIdFromClientId(client.id);
            const messageTopic      = topicStructure[3]
            switch (messageTopic)   {
                case topics.messageTypeTopics.message   : validator.message(payload); break;
                default                                 : throw new Error('Invaild message topic')
            }
            
            if(await chatServices.isConversationBlocked(payload, userId))
                throw new Error(`Follow the service provider`)
            payload.last_message_time = new Date()
        }
    
        async function validateGroupChat(payload, topicStructure) {
            const userId = utils.getUserIdFromClientId(client.id);
            const messageTopic      = topicStructure[3]
            switch (messageTopic)   {
                case topics.messageTypeTopics.message   : validator.message(payload); break;
                case topics.messageTypeTopics.addUser   : 
                case topics.messageTypeTopics.removeUser: validator.addOrRemoveUser(payload); break;
                default                                 : throw new Error('Invaild message topic')
            }
            if(messageTopic !== topics.messageTypeTopics.block) {
                if(await chatServices.isConversationBlocked(payload, userId))
                    throw new Error(`Conversation Blocked`)
                payload.last_message_time = new Date()
            }
        }
    
        // async function validateCampaignChat(payload, topicStructure) {
        //     const userId = utils.getUserIdFromClientId(client.id);
        //     if(await chatServices.isConversationBlocked(payload, userId))
        //             throw new Error(`Conversation Blocked`)
        //     payload.last_message_time = new Date()
        // }

    }

    function sendDisconnectPublish (clientId) {
        const {userId, platform}    = utils.getPlatformAndUserTypeAndIdFromClientId(clientId);
        const topic                 = topics.disconnectUser(userId);
        aedes.publish({topic, payload: JSON.stringify({type: 'disconnect', data: {platform}})}, null);
    }
};