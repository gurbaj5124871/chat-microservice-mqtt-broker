'use strict'

const getUserTopic      = userId => `chat/single/${userId}`

module.exports          = Object.freeze({
    baseTopics          : {
        chat            : 'chat'
    },
    // chat topics
    chatTypeTopics   : {
        single          : 'single', // direct messages (DMs)
        channel         : 'channel', // sp's parent group
        group           : 'group', // also be called as sub channels
        campaign        : 'campaign' // marketing campaigns as channels
    },
    messageTypeTopics   : {
        // common topics
        message         : 'message',
        disconnect      : 'disconnect',
        // single chat topics
        block           : 'block',
        // group chat topics
        addUser         : 'addUser',
        removeUser      : 'removeUser',
        // channel chat topics
        follow          : 'follow',
        unfollow        : 'unfollow',
        //campaign chat topics
        join            : 'join',
        leave           : 'leave'
    },
    // direct one-on-one topics
    // users will subscribe on their own userId topics with # in end ex: chat/single/
    getUserTopic        : userId => `chat/single/${userId}`,
    messageUser         : otherUserId => `${getUserTopic(otherUserId)}/message`,    
    disconnectUser      : userId => `${getUserTopic(userId)}/disconnect`,
    // block the user from single conversation
    blockUser           : otherUserId => `${getUserTopic(otherUserId)}/block`,
    unblockUser         : otherUserId => `${getUserTopic(otherUserId)}/unblock`,
    // sends push to other user to unsubscribe/subscribe from/to the channel/group/campaign, message body has the further details
    addUser             : otherUserId => `${getUserTopic(otherUserId)}/addUser`,
    removeUser          : otherUserId => `${getUserTopic(otherUserId)}/removeUser`,

    // broadcast topics i.e channels, groups and campaigns
    getBroadcastTopic   : (spId, conversationId) => `chat/broadcast/${spId}-${conversationId}`,
    messageBroadcast    : (spId, conversationId) => `${this.getBroadcastTopic(spId, conversationId)}/message`

    
})