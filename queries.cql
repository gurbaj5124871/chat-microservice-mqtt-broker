-- Variable values used
-- sp id = sp_1, cp id = cp_1, cp 2 id = cp_2

-- for channel
-- sp channel id = 37c218f0-805a-11e9-b521-71449ee21de7
-- last_message_id = cd8f2cd0-8067-11e9-a0e3-49579b1bf56a

-- for single chat
-- conversation_id = 152eb480-8067-11e9-b539-dde96b62ccd6

-- for group chat
-- sp group id = 6a57dec0-7c8c-11e9-b3d1-19251204d389, sp group last message id = 37c218f0-805a-11e9-b521-71449ee21de7

USE dhandahub_chat;

-- SP Approved by admin so create a channel for sp
INSERT INTO conversations (
    conversation_id, user_id, conversation_type, conversation_user_type,
    last_message_id, last_message_content, last_message_sender_id, last_message_type, image_url
) VALUES (
    '37c218f0-805a-11e9-b521-71449ee21de7', 'sp_1', 'channel', 'service_provider',
    'cd8f2cd0-8067-11e9-a0e3-49579b1bf56a', 'This is the beginning of the sp name community', 'sp_1', 'event_notification', 'google.com'
);

-- CP followes SP i.e cp joins sp main channel
INSERT INTO conversations (
    conversation_id, user_id, other_user_id, conversation_type, conversation_user_type,
    last_message_id, last_message_content, last_message_sender_id, last_message_type, image_url
) VALUES (
    '37c218f0-805a-11e9-b521-71449ee21de7', 'cp_1', 'sp_1', 'channel', 'customer',
    'cd8f2cd0-8067-11e9-a0e3-49579b1bf56a', 'This is the beginning of the sp name community', 'sp_1', 'event_notification', 'google.com'
);

-- cp gets single chat with sp and vice versa (values for user_id and other_user_id switches)
SELECT conversation_id FROM conversations_by_pair
WHERE user_id = 'cp_1' AND other_user_id = 'sp_1';

-- if direct convo does not exists then conversation is created with last messages as null
BEGIN BATCH
INSERT INTO conversations (conversation_id, user_id, other_user_id, conversation_type, conversation_user_type)
VALUES ('152eb480-8067-11e9-b539-dde96b62ccd6', 'cp_1', 'sp_1', 'single', 'customer');
INSERT INTO conversations (conversation_id, user_id, other_user_id, conversation_type, conversation_user_type)
VALUES ('152eb480-8067-11e9-b539-dde96b62ccd6', 'sp_1', 'cp_1', 'single', 'service_provider');
APPLY BATCH

-- cp_1 blocks sp_1 from direct chat
UPDATE conversations SET is_blocked = true where conversation_id = '152eb480-8067-11e9-b539-dde96b62ccd6' AND user_id = 'sp_1' AND conversation_type = 'single';

-- sp creates a group selecting cps from his/her followers
-- batch queries are on same table so they are optimised, atomic and isolated
BEGIN BATCH
INSERT INTO conversations (
    conversation_id, user_id, conversation_type, conversation_user_type,
    last_message_id, last_message_content, last_message_sender_id, last_message_type, image_url
) VALUES (
    '6a57dec0-7c8c-11e9-b3d1-19251204d389', 'sp_1', 'group', 'service_provider',
    '37c218f0-805a-11e9-b521-71449ee21de7', 'this is the beginning of group groupname', 'sp_1', 'event_notification', 'yahoo.com'

)
INSERT INTO conversations (
    conversation_id, user_id, other_user_id, conversation_type, conversation_user_type,
    last_message_id, last_message_content, last_message_sender_id, last_message_type, image_url
) VALUES (
    '6a57dec0-7c8c-11e9-b3d1-19251204d389', 'cp_1', 'sp_1', 'group', 'customer',
    '37c218f0-805a-11e9-b521-71449ee21de7', 'this is the beginning of group groupname', 'sp_1', 'event_notification', 'yahoo.com'

);
INSERT INTO conversations (
    conversation_id, user_id, other_user_id, conversation_type, conversation_user_type,
    last_message_id, last_message_content, last_message_sender_id, last_message_type, image_url
) VALUES (
    '6a57dec0-7c8c-11e9-b3d1-19251204d389', 'cp_2', 'sp_1', 'group', 'customer',
    '37c218f0-805a-11e9-b521-71449ee21de7', 'this is the beginning of group groupname', 'sp_1', 'event_notification', 'yahoo.com'

);
APPLY BATCH;

-- cp_1 mutes the sp_1 channel for some time i.e with ttl (in sec) for the is_mutted
UPDATE conversations USING TTL 20 SET is_muted = true WHERE conversation_id = '37c218f0-805a-11e9-b521-71449ee21de7' AND user_id = 'cp_1' AND other_user_id = 'sp_1';

-- cp_2 leaves sp_1 group or sp_1 removes cp_2 from group, convo exists for cp but cannot message in it
UPDATE conversations SET is_deleted = true WHERE conversation_id = '6a57dec0-7c8c-11e9-b3d1-19251204d389' AND user_id = 'cp_2' AND conversation_type = 'group';
-- cp_2 deletes the group convo (with or without leaving the group)
DELETE conversations WHERE conversation_id = '6a57dec0-7c8c-11e9-b3d1-19251204d389' AND user_id = 'cp_2' AND conversation_type = 'group';

-- sp_1 deletes group which will delete convo for sp_1 but for cp's convos will exists but cannot message in it
-- batch queries are on same table and on same primary key value so they are optimised, atomic and isolated
BEGIN BATCH
DELETE conversations WHERE conversation_id = '6a57dec0-7c8c-11e9-b3d1-19251204d389' AND user_id = 'sp_1' AND conversation_type = 'group';
UPDATE conversations SET is_deleted = true WHERE conversation_id = '6a57dec0-7c8c-11e9-b3d1-19251204d389';
APPLY BATCH;

-- message query is same for all types of conversations
INSERT INTO message (message_id, conversation_id, content, sender_id, message_type)
VALUES ('cd8f2cd0-8067-11e9-a0e3-49579b1bf56a', '37c218f0-805a-11e9-b521-71449ee21de7', 'hello guys', 'sp_1', 'text');
-- now get all the group member ids as stream to update their unread count
-- so setting unread count for one member only
UPDATE unread_count SET unread = unread + 1 WHERE conversation_id = '37c218f0-805a-11e9-b521-71449ee21de7' AND user_id = 'cp_1';

-- cp acknowledges the message got delivered
UPDATE message_acknowledgement_status SET is_delivered = true
WHERE conversation_id = '37c218f0-805a-11e9-b521-71449ee21de7' AND messsage_id = 'cd8f2cd0-8067-11e9-a0e3-49579b1bf56a' AND user_id = 'cp_1';

-- cp acknowledgesthe message is seen
UPDATE message_acknowledgement_status SET is_seen = true
WHERE conversation_id = '37c218f0-805a-11e9-b521-71449ee21de7' AND messsage_id = 'cd8f2cd0-8067-11e9-a0e3-49579b1bf56a' AND user_id = 'cp_1';

-- users get their conversations
SELECT * FROM conversations_by_time WHERE user_id = 'cp_1' -- with batch limit

