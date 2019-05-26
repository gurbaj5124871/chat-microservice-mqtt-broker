DROP KEYSPACE IF EXISTS dhandahub_chat;
CREATE KEYSPACE dhandahub_chat WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };

use dhandahub_chat;

CREATE TABLE conversations (
    conversation_id TIMEUUID,
    user_id TEXT,
    other_user_id TEXT,
    conversation_type TEXT, -- single or channel conversation
    conversation_user_type TEXT, -- customer or service provider
    last_message_id TIMEUUID,
    last_message_content TEXT,
    last_message_sender_id TEXT,
    last_message_type TEXT,
    is_blocked BOOLEAN, -- for single conversations, in case of channel customer's row will be deleted
    is_muted BOOLEAN,
    image_url TEXT,
    PRIMARY KEY (conversation_id, user_id, conversation_type)
);

CREATE MATERIALIZED VIEW conversations_by_time AS
    SELECT * FROM conversations
    WHERE conversation_id IS NOT NULL AND user_id IS NOT NULL AND last_message_id IS NOT NULL AND conversation_type IS NOT NULL
    PRIMARY KEY (user_id, last_message_id, conversation_id, conversation_type)
    WITH CLUSTERING ORDER BY (last_message_id DESC);

CREATE MATERIALIZED VIEW conversations_by_pair AS
    SELECT * FROM conversations 
    WHERE conversation_id IS NOT NULL AND user_id IS NOT NULL AND other_user_id IS NOT NULL AND conversation_type = 'single'
    PRIMARY KEY ((user_id, other_user_id), conversation_type, conversation_id);

CREATE TABLE message (
    message_id timeuuid,
    conversation_id timeuuid,
    content text,
    sender_id text,
    PRIMARY KEY (conversation_id, message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);

CREATE TABLE unread_count (
    conversation_id timeuuid,
    user_id text,
    unread counter,
    PRIMARY KEY (conversation_id, user_id)
);