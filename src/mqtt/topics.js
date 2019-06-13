module.exports          = Object.freeze({
    baseTopics          : {
        chat            : 'chat',
        microservice    : 'microservice'
    },
    // chat topics
    chatTypeTopics   : {
        single          : 'single', // direct messages (DMs)
        channel         : 'channel', // sp's parent group
        group           : 'group', // also be called as sub channels
        campaign        : 'campaign' // marketing campaigns as channels
    },
    // direct one-on-one topics
    // users will subscribe on their own userId topics with # in end ex: chat/single/
    getUserTopic        : userId => `chat/single/${userId}`,
    messageUser         : otherUserId => `${this.getUserTopic(otherUserId)}/message`,    
    disconnectUser      : userId => `${this.getUserTopic(userId)}/disconnect`,
    // block the user from single conversation
    blockUser           : otherUserId => `${this.getUserTopic(otherUserId)}/block`,
    unblockUser         : otherUserId => `${this.getUserTopic(otherUserId)}/unblock`,
    // sends push to other user to unsubscribe/subscribe from/to the channel/group/campaign, message body has the further details
    removeUser          : otherUserId => `${this.getUserTopic(otherUserId)}/removeUser`,
    addUser             : otherUserId => `${this.getUserTopic(otherUserId)}/addUser`,

    // broadcast topics i.e channels, groups and campaigns
    getBroadcastTopic   : (spId, conversationId) => `chat/broadcast/${spId}-${conversationId}`,
    messageBroadcast    : (spId, conversationId) => `${this.getBroadcastTopic(spId, conversationId)}/message`,


    // microservices topics
    getMsTopic          : msName => `microservice/${msName}`
})