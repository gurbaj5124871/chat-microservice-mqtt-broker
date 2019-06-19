'use strict';

const {redis, redisKeys}        = require('../utils/redis'),
    mongoCollections            = require('../utils/mongo'),
    constants                   = require('../utils/constants'),
    universalFunc               = require('../utils/universal-functions');

const getUserTypeFromClientId   = clientId => clientId.split('-')[0];

const getUserIdFromClientId     = clientId => clientId.split('-')[1];

const getPlatformFromClientId   = clientId => clientId.split('-')[2];

const getPlatformAndUserTypeAndIdFromClientId = clientId => {
    const split = clientId.split('-');
    return {userType: split[0], userId: split[1], platform: split[2]}
};

const isClientActive            = async (clientId) => {
    const {userId, platform}    = getPlatformAndUserTypeAndIdFromClientId(clientId);
    const userConnectionData    = JSON.parse(await redis.hget(redisKeys.getActiveMqttUsersMapKey, userId));
    return userConnectionData   !== null && userConnectionData[platform] !== undefined;
};

const doesSubscriberHasTopic    = async (userType, userId, topic) => {
    const userKey               = userType === constants.userRoles.customer ? 'customerId' : 'serviceProviderId'
    const criteria              = {[userKey]: universalFunc.mongoUUID(userId), mqttTopics: topic, isDeleted: false}
    const dbTopic               = await mongodb.collection(mongoCollections.followings).findOne(criteria, {_id: 1})
    return dbTopic ? true : false
}

module.exports                  = {
    getUserTypeFromClientId,
    getUserIdFromClientId,
    getPlatformFromClientId,
    getPlatformAndUserTypeAndIdFromClientId,
    isClientActive,
    doesSubscriberHasTopic
}