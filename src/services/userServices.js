'use strict'

const {redis, redisKeys}    = require('../utils/redis'),
    cassandra               = require('../../bootstrap/cassandra').client,
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

const updateLastSeen        = async (event, clientId) => {
    const {userType, userId, platform} = mqttUtils.getPlatformAndUserTypeAndIdFromClientId(clientId);
    const query             = `INSERT INTO last_seen (user_id, user_type, platform, last_seen, last_seen_event) VALUES (?, ?, ?, ?, ?)`;
    const params            = [userId, userType, platform, new Date(), event]
    await cassandra.execute(query, params, {prepare: true})
}

module.exports              = {
    addAsActiveUser,
    removeAsActiveUser,
    updateLastSeen
}