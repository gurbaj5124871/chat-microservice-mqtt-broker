'use strict';

const {redis, redisKeys}        = require('../utils/redis');
const {monogdb, collections}    = require('../utils/mongo');
const constants                 = require('../utils/constants');

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

const doesSubscriberHasTopic    = async (userType, userId, platform, topic) => {
    const collection            = (userType => {
        switch(userType)        {
            case constants.userRoles.customer       : return collections.customermqtts;
            case constants.userRoles.serviceProvider: return collections.serviceprovidermqtts;
        }
    })(userType);
    const dbTopic               = await monogdb.collection(collection).findOne({userId, topic}, {_id: 1})
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