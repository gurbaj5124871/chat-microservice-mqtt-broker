'use strict';

const validator = require('./validator'),
    logger = require('../utils/logger'),
    authentication = require('../utils/authentication'),
    constants = require('../utils/constants');

module.exports = aedes => {
    aedes.authenticate = authenticateClient;
    aedes.authorizeSubscribe = authoriseSubscribe;
    aedes.authorizePublish = authorisePublish;
    // aedes.authorizeForward = function () {}

    async function authenticateClient (client, username, password, callback) {
        try {
            // const authenticatedClient = await authentication.verifyToken(password.toString());
            // const senderId = userUtil.getUserIdFromClientId(client.id);
            // const clientIdValid = senderId === authenticatedClient.userId && senderId === username;
            // const clientActive = await userHelper.isClientActive(client.id);
            // if (clientIdValid && clientActive)
            //     sendDisconnectPublish(client.id);
            //callback(null, clientIdValid);
            callback()
        } catch (err) {
            logger.warn(err);
            callback(null, false);
        }
    }

    async function authoriseSubscribe (client, subscription, callback) {
        try {
            // const topicStructure = subscription.topic.split('/');
            // if (userUtil.getUserIdFromClientId(client.id) !== topicStructure[0]) {
            //     logger.warn(client.id + ' Tried to subscribe to unauthorised topic ' + subscription.topic);
            //     subscription = null;
            // }
            // callback(null, subscription);
        } catch (err) {
            callback(err);
        }
    }

    async function authorisePublish(client, packet, callback) {
        try {
            // validatePublish(packet);
            // const topicStructure = packet.topic.split('/');
            // if (['block', 'removed_from_group', 'added_to_group', 'add_new_admin'].includes(topicStructure[1]) === false) {
            //     const payload = JSON.parse(packet.payload);
            //     const senderId = userUtil.getUserIdFromClientId(client.id);
            //     const {conversationDetail, blocked} = await conversationHelper.getConversationDetails(payload.data.conversation.conversation_id, senderId)
            //     if (blocked === true)
            //         callback(new Error(client.id + ' publishing to blocked conversation ' + packet.topic));
            //     else {
            //         payload.data.conversation.last_message_time = new Date();
            //         payload.data.last_message_type = payload.data.last_message_type ? payload.data.last_message_type : constants.messageType.text;
            //         payload.data.conversation.conversation_details = conversationDetail;
            //         packet.payload = JSON.stringify(payload);
            //     }
            // }
            callback();
        } catch (err) {
            if (err.code === 'ERR_ASSERTION')
                logger.warn('Expected', err.expected, 'Actual', err.actual);
            callback(err);
        }
    }

    function validatePublish(packet) {
        // const topicStructure = packet.topic.split('/');
        // const payload = JSON.parse(packet.payload.toString());
        // switch (topicStructure[1]) {
        //     case 'chat':
        //     case 'group_chat':
        //         assert.notStrictEqual(payload.data.conversation.last_message_content, undefined, 'message content is undefined');
        //         assert.notStrictEqual(payload.data.conversation.last_message_content, '', 'message content is empty');
        //         assert.notStrictEqual(payload.data.conversation.conversation_id, undefined, 'conversation ID is undefined');
        //         assert.notStrictEqual(payload.data.conversation.conversation_id, '', 'conversation ID is empty');
        //         if(payload.data.conversation.last_message_type && ![constants.messageType.text].includes(payload.data.conversation.last_message_type))
        //             assert.fail('Message type not supported')
        //         break;
        //     case 'block':
        //         assert.notStrictEqual(payload.data.conversation.conversation_id, undefined, 'conversation ID is undefined');
        //         assert.notStrictEqual(payload.data.conversation.conversation_id, '', 'conversation ID is empty');
        //         assert.notStrictEqual(payload.data.conversation.blocked, undefined, 'blocked is undefined');
        //         assert.strictEqual(typeof payload.data.conversation.blocked, 'boolean', 'blocked is not boolean');
        //         break;
        //     case 'added_to_group':
        //     case 'removed_from_group':
        //     case 'add_new_admin':
        //         assert.notStrictEqual(payload.data.conversation.group_topic, undefined, 'group topic is undefined');
        //         assert.notStrictEqual(payload.data.conversation.group_topic, '', 'group topic is empty');
        //         assert.notStrictEqual(payload.data.conversation.conversation_id, undefined, 'conversation ID is undefined');
        //         assert.notStrictEqual(payload.data.conversation.conversation_id, '', 'conversation ID is empty');
        //         assert.notStrictEqual(payload.data.conversation.reciever_id, undefined, 'conversation ID is undefined');
        //         assert.notStrictEqual(payload.data.conversation.reciever_id, '', 'conversation ID is empty');
        //         break;
        //     default:
        //         throw new assert.AssertionError({
        //             message: 'Invalid topic',
        //             expected: constants.supportedTopics,
        //             actual: topicStructure[1]
        //         });
        // }
    }

    function sendDisconnectPublish (clientId) {
        // const {userId, platform} = userUtil.getPlatformAndUserIdFromClientId(clientId);
        // const topic = userId + '/disconnect';
        // aedes.publish({topic: topic, payload: JSON.stringify({type: 'disconnect', data: {platform: platform}})}, null);
    }
};