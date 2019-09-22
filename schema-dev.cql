DROP KEYSPACE IF EXISTS dhandahub_chat;
CREATE KEYSPACE dhandahub_chat WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };

use dhandahub_chat;

CREATE TABLE conversations (
    conversation_id TIMEUUID,
    user_id TEXT,
    other_user_id TEXT, -- for conversation_user_type = service_provider other_user_id will always be null except conversation_type = single
    conversation_type TEXT, -- single / channel / group or sub channel / camapaign conversations
    conversation_user_type TEXT, -- customer or service provider
    -- conversation_name TEXT, <<to think more>> -- for single convo (sp/cp name), for channel sp name + community, for group sp names it
    last_message_id TIMEUUID,
    last_message_content TEXT,
    last_message_sender_id TEXT,
    last_message_type TEXT,
    is_blocked BOOLEAN, -- for single conversations, other user blocked user, in case of unfollow all conversations of cp will be blocked
    is_muted BOOLEAN, -- notifications turned off, only for channel and group conversations
    is_deleted BOOLEAN, -- This is when sp deletes group, convo will exists for cps but can't message in them
    image_url TEXT,
    PRIMARY KEY (conversation_id, user_id, conversation_type)
);

-- for getting all the conversations
CREATE MATERIALIZED VIEW conversations_by_time AS
    SELECT * FROM conversations
    WHERE conversation_id IS NOT NULL AND user_id IS NOT NULL AND last_message_id IS NOT NULL AND conversation_type IS NOT NULL
    PRIMARY KEY (user_id, conversation_type, last_message_id, conversation_id)
    WITH CLUSTERING ORDER BY (last_message_id DESC);

-- for getting single conversation
CREATE MATERIALIZED VIEW conversation_by_pairs AS
    SELECT * FROM conversations 
    WHERE conversation_id IS NOT NULL AND user_id IS NOT NULL AND other_user_id IS NOT NULL AND conversation_type IS NOT NULL
    PRIMARY KEY ((user_id, other_user_id), conversation_type, conversation_id);

CREATE TABLE message (
    message_id TIMEUUID,
    conversation_id TIMEUUID,
    content TEXT,
    sender_id TEXT,
    sender_type TEXT,
    message_type TEXT,
    is_deleted BOOLEAN,
    reply_message_id TIMEUUID,
    reply_message_content TEXT,
    PRIMARY KEY (conversation_id, message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);

CREATE TABLE unread_count (
    conversation_id TIMEUUID,
    user_id TEXT,
    unread COUNTER,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE message_acknowledgement_status (
    message_id TIMEUUID,
    conversation_id TIMEUUID,
    user_id TEXT,
    is_delivered BOOLEAN,
    is_seen BOOLEAN,
    PRIMARY KEY (conversation_id, message_id, user_id)
) WITH CLUSTERING ORDER BY (message_id DESC);

CREATE TABLE last_seen (
    user_id TEXT,
    user_type TEXT,
    platform TEXT,
    last_seen TIMESTAMP,
    last_seen_event TEXT,
    PRIMARY KEY (user_id, last_seen)
) WITH CLUSTERING ORDER BY (last_seen DESC);