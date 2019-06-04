const {redis, redisKeys}            = require('./redis'),
    constants                       = require('./constants');

function getSessionKey(userId, role){
    const sessionkey                = (role => {
        const roles                 = constants.userRoles
        switch(role)                {
            case roles.customer     : return redisKeys.customerSession(userId)
            case roles.serviceProvider: return redisKeys.serviceProviderSession(userId)
            case roles.admin        : return redisKeys.adminSession(userId)
        }
    })(role);
    return sessionkey          
}

const getSessionFromToken           = tokenData => {
    const {userId, sessionId, role} = tokenData;
    const sessionkey                = getSessionKey(userId, role)
    return redis.hmgetAsync(sessionkey, sessionId)
}

const getAllSessionsFromUserId      = async (userId, role) => {
    const sessionkey                = getSessionKey(userId, role)
    const sessions                  = await redis.hgetallAsync(sessionkey)
    const sessObj                   = {}
    for(let i=0; i<sessions.length; i+=2)
        sessObj[sessions[i]]        = JSON.parse(sessions[i+1])
    return sessObj                   
}

const getAllSessionsForUsers        = async (userIds, role) => {
    const sessionKeys               = userIds.map(userId => getSessionKey(userId, role))
    let batch                       = redis.batchAsync();
    for(const sessionKey of sessionKeys)
        batch                       = batch.hmgetAsync(sessionKey)
    const sessions                  = await batch.execAsync()
    return sessions
}

const expireSessionFromToken        = tokenData => {
    const {userId, sessionId, role} = tokenData.payload;
    const sessionkey                = getSessionKey(userId, role)
    return redis.hdelAsync(sessionkey, sessionId)
}

const expireAllSessionsOfUser       = userId => {
    const sessionKeys               = Object.values(constants.userRoles).map(role => getSessionKey(userId, role))
    let batch                       = redis.batchAsync()
    for(const sessionKey of sessionKeys)
        batch                       = batch.delAsync(sessionKey)
    return batch.execAsync()
}

const expireAllSessionsOfBatchUsers= (userIds, role) => {
    const sessionKeys               = userIds.map(userId => getSessionKey(userId, role))
    let batch                       = redis.batchAsync()
    for(const sessionKey of sessionKeys)
        batch                       = batch.delAsync(sessionKey)
    return batch.execAsync()
}

module.exports                      = {
    getSessionFromToken,
    getAllSessionsFromUserId,
    getAllSessionsForUsers,
    expireSessionFromToken,
    expireAllSessionsOfUser,
    expireAllSessionsOfBatchUsers
}