'use strict'

const {redis, redisKeys}    = require('../utils/redis'),
    mqttUtils               = require('../mqtt/utils');

const addAsActiveUser       = async clientId => {
    const {userId, platform}= mqttUtils.getPlatformAndUserTypeAndIdFromClientId(clientId)
    const userMqttKey       = redisKeys.getActiveMqttUsersMapKey
    const userConnectionData= JSON.parse(await redis.hget(userMqttKey, userId))
    const updatedUserConnectionData = userConnectionData === null ? {[platform]: clientId} : Object.assign(userConnectionData, {[platform]: clientId})
    return redis.hset(userMqttKey, userId, JSON.stringify(updatedUserConnectionData))
};

const removeAsActiveUser    = async clientId => {
    const {userId, platform}= mqttUtils.getPlatformAndUserTypeAndIdFromClientId(clientId);
    const userMqttKey       = redisKeys.getActiveMqttUsersMapKey
    const userConnectionData= JSON.parse(await redis.hget(userMqttKey, userId));
    if (userConnectionData === null || userConnectionData[platform] !== clientId)
        return
    delete userConnectionData[platform];
    if (Object.keys(userConnectionData).length === 0)
        return redis.hdel(userMqttKey, userId)
    else
        return redis.hset(userMqttKey, userId, JSON.stringify(userConnectionData))
};

module.exports              = {
    addAsActiveUser,
    removeAsActiveUser
}