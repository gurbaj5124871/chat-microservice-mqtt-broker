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
    return redis.hmget(sessionkey, sessionId)
}

const getAllSessionsFromUserId      = async (userId, role) => {
    const sessionkey                = getSessionKey(userId, role)
    const sessions                  = await redis.hgetall(sessionkey)
    const sessObj                   = {}
    for(let i=0; i<sessions.length; i+=2)
        sessObj[sessions[i]]        = JSON.parse(sessions[i+1])
    return sessObj                   
}

const getAllSessionsForUsers        = async (userIds, role) => {
    const sessionKeys               = userIds.map(userId => getSessionKey(userId, role))
    let batch                       = redis.pipeline();
    for(const sessionKey of sessionKeys)
        batch                       = batch.hmget(sessionKey)
    const sessions                  = await batch.exec()
    return sessions
}

const expireSessionFromToken        = tokenData => {
    const {userId, sessionId, role} = tokenData.payload;
    const sessionkey                = getSessionKey(userId, role)
    return redis.hdel(sessionkey, sessionId)
}

const expireAllSessionsOfUser       = userId => {
    const sessionKeys               = Object.values(constants.userRoles).map(role => getSessionKey(userId, role))
    let batch                       = redis.pipeline()
    for(const sessionKey of sessionKeys)
        batch                       = batch.del(sessionKey)
    return batch.exec()
}

const expireAllSessionsOfBatchUsers= (userIds, role) => {
    const sessionKeys               = userIds.map(userId => getSessionKey(userId, role))
    let batch                       = redis.pipeline()
    for(const sessionKey of sessionKeys)
        batch                       = batch.del(sessionKey)
    return batch.exec()
}

module.exports                      = {
    getSessionFromToken,
    getAllSessionsFromUserId,
    getAllSessionsForUsers,
    expireSessionFromToken,
    expireAllSessionsOfUser,
    expireAllSessionsOfBatchUsers
}