'use strict'

const cassandra                 = require('../../bootstrap/cassandra').client,
    cassandraDriver             = require('cassandra-driver'),
    {redis, redisKeys}          = require('../utils/redis'),
    logger                      = require('../utils/logger'),
    constants                   = require('../utils/constants');

const newMessageReceived        = async (payload, senderId, conversationType) => {
    try {
        const {conversation_id  : conversationId, last_message_content: content, last_message_type: messageType} = payload.data;
        const messageId         = cassandraDriver.types.TimeUuid.now();
        await createMessage(conversationId, messageId, content, messageType, senderId);
        await updateConversations(conversationId, messageId, content, messageType, senderId, conversationType, null);
    } catch (err) {
        logger.error(err)
    }
}

function createMessage(conversationId, messageId, content, messageType, senderId) {
    const query = 'INSERT INTO message (conversation_id, message_id, content, message_type, sender_id) VALUES (?, ?, ?, ?, ?)';
    const params = [conversationId, messageId, content, messageType, senderId];
    return cassandra.execute(query, params, {prepare: true});
}

async function updateConversations(conversationId, messageId, content, messageType, senderId, conversationType, pageState = null) {
    const conversationsQuery    = `SELECT user_id, is_blocked, is_muted, is_deleted FROM conversations WHERE conversation_id = ?`
    const users                 = await cassandra.execute(conversationsQuery, [conversationId], {fetchSize: 1000, prepare: true, pageState})
    if(users.rowLength)         {
        const {filteredUsers, unmutedUsers} = users.rows.reduce((result, convo) => {
            if(convo.is_blocked !== true && convo.is_deleted !== true) {
                result.filteredUsers.push(convo.user_id)
                if(convo.is_muted !== true)
                    result.unmutedUsers.add(convo.user_id)
            }
            return result
        }, {filteredUsers: [], unmutedUsers: new Set()})
        unmutedUsers.delete(senderId)
        const updateConversation= `UPDATE conversations SET last_message_id = ?, last_message_content = ?, 
            last_message_type = ?, last_message_sender_id = ? WHERE conversation_id = ? AND user_id IN ? AND conversation_type = ?`;
        const messUpdateparams  = [messageId, content, messageType, senderId, conversationId, filteredUsers, conversationType]
        await cassandra.execute(updateConversation, messUpdateparams, {prepare: true})
        await updateUnreadCount(conversationId, filteredUsers)
        handleNotifications(senderId, [...unmutedUsers], conversationType)
        if(users.pageState !== null)
            await updateConversationsWithUnreadCount(conversationId, messageId, content, messageType, senderId, conversationType, users.pageState)
    }
}

async function updateUnreadCount(conversationId, userIds = []) {
    const unreadCountQuery  = `UPDATE unread_count SET unread = unread + 1 WHERE conversation_id = ? AND user_id IN ?`
    await cassandra.execute(unreadCountQuery, [conversationId, userIds], {prepare: true})
}

async function handleNotifications(sender, recievers, conversationType) {
    try {
        // update unread count
        const usersNotificaitonKeys = recievers.map(id => redisKeys.userNotificationCount(id))
        const existsPipeline    = redis.pipeline()
        usersNotificaitonKeys.forEach(key => existsPipeline.exists(key))
        const exists            = await existsPipeline.exec()
        const batch             = redis.pipeline()
        for(let i=0; i<exists.length; i+=1) {
            if(exists[i][1] === 1)
                batch.incr(usersNotificaitonKeys[i])
            else batch.set(usersNotificaitonKeys[i], 1)
        }
        await batch.exec()
        // send push to the users

    } catch (err) {
        logger.error(err)
    }
}

const isConversationBlocked     = async (payload, userId) => {
    const conversationId        = payload.data.conversation_id
    const query                 = `SELECT is_blocked FROM conversations where conversation_id = ? AND user_id = ?`;
    const result                = await cassandra.execute(query, [conversationId, userId], {prepare: true})
    return result.rowLength ? (result.rows[0].is_blocked ? true : false) : true
}

module.exports                  = {
    newMessageReceived,
    isConversationBlocked
}