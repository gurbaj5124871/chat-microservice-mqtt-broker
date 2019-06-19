const redis                 = require('../../bootstrap/redis').redisClient;

const redisKeys             = Object.freeze({
    // Map containing user Ids as key and platform specific client Ids as value
    // Never Expire
    // Cleared on broker restart
    getActiveMqttUsersMapKey: 'usersMQTT',

    // Hash map storing customers sessions [ NEVER EXPIRE ON PROD] {key : {sessionId: session}}
    customerSession         : customerId => `customerSession:${customerId}`,

    // Hash map storing service provider sessions [ NEVER EXPIRE ON PROD] {key : {sessionId: session}}
    serviceProviderSession  : serviceProviderId => `serviceProviderSession:${serviceProviderId}`,

    // Hash map storing admins sessions {key : {sessionId: session}}
    adminSession            : adminId => `adminSession:${adminId}`,

    userNotificationCount   : userId => `userNotificationCount:${userId}`
    
    
})

module.exports              = {
    redis,
    redisKeys
}