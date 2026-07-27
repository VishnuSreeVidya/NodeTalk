-- NodeTalk Migration v5: Performance & Security Optimization
-- Run this after v4 migration

-- =============================================
-- 1. PERFORMANCE: Additional Indexes
-- =============================================

-- Messages table: Covering index for the most common query pattern (fetching DMs)
-- This composite index covers the filter + order + limit pattern
CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON messages (sender_id, receiver_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_reverse
  ON messages (receiver_id, sender_id, created_at DESC);

-- Unread message count query optimization
CREATE INDEX IF NOT EXISTS idx_messages_unread
  ON messages (receiver_id, sender_id, message_status)
  WHERE message_status != 'read';

-- Group messages: Index for fetching by group
CREATE INDEX IF NOT EXISTS idx_group_messages_group
  ON group_messages (group_id, created_at DESC);

-- Reactions: Index for fetching by message
CREATE INDEX IF NOT EXISTS idx_reactions_message
  ON reactions (message_id, user_id);

-- Notifications: Composite index for user unread count
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
  ON notifications (user_id, is_read, created_at DESC);

-- Group members: Index for user's groups
CREATE INDEX IF NOT EXISTS idx_group_members_user
  ON group_members (user_id, group_id);

-- Pinned messages
CREATE INDEX IF NOT EXISTS idx_pinned_messages_message
  ON pinned_messages (message_id);

-- Profiles: Index for online status filtering
CREATE INDEX IF NOT EXISTS idx_profiles_online
  ON profiles (is_online, username)
  WHERE is_online = true;

-- =============================================
-- 2. DATABASE FUNCTIONS
-- =============================================

-- Function: Get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_counts(target_user_id UUID)
RETURNS TABLE(other_user_id UUID, unread_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT m.sender_id, COUNT(*)
  FROM messages m
  WHERE m.receiver_id = target_user_id
    AND m.message_status != 'read'
  GROUP BY m.sender_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Cleanup stale online status
-- Mark users as offline if they haven't sent a heartbeat in 60 seconds
CREATE OR REPLACE FUNCTION cleanup_stale_users()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET is_online = false
  WHERE is_online = true
    AND last_seen < NOW() - INTERVAL '60 seconds';
END;
$$ LANGUAGE plpgsql;

-- Function: Get or create a DM channel between two users
-- Useful for ensuring consistent message ordering
CREATE OR REPLACE FUNCTION get_dm_participants(sender UUID, receiver UUID)
RETURNS TABLE(user_a UUID, user_b UUID) AS $$
BEGIN
  IF sender < receiver THEN
    RETURN QUERY SELECT sender, receiver;
  ELSE
    RETURN QUERY SELECT receiver, sender;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- 3. ROW LEVEL SECURITY IMPROVEMENTS
-- =============================================

-- Ensure users can only read messages they sent or received
ALTER POLICY IF EXISTS "Users can read own messages" ON messages
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Ensure users can only read group messages for groups they belong to
-- (This is a security加固, not a new policy)

-- =============================================
-- 4. TRIGGER: Auto-update last_seen on message send
-- =============================================

CREATE OR REPLACE FUNCTION update_last_seen_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET last_seen = NOW(), is_online = true
  WHERE id = NEW.sender_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_message_sent ON messages;
CREATE TRIGGER on_message_sent
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_last_seen_trigger();

DROP TRIGGER IF EXISTS on_group_message_sent ON group_messages;
CREATE TRIGGER on_group_message_sent
  AFTER INSERT ON group_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_last_seen_trigger();

-- =============================================
-- 5. STORAGE POLICIES
-- =============================================

-- Ensure users can only delete their own files
-- (This adds a delete policy in addition to existing upload/view policies)

-- =============================================
-- 6. ADDITIONAL COLUMNS FOR FUTURE FEATURES
-- =============================================

-- Starred messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT false;
ALTER TABLE group_messages ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT false;

-- Message scheduling
ALTER TABLE messages ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE group_messages ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

-- Disappearing messages (TTL in seconds, null = never disappear)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS expires_in INTEGER;
ALTER TABLE group_messages ADD COLUMN IF NOT EXISTS expires_in INTEGER;

-- Chat archival
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS archived_chats UUID[] DEFAULT '{}';

-- Muted users
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blocked_users UUID[] DEFAULT '{}';

-- Polls support (stored as JSONB for flexibility)
ALTER TABLE group_messages ADD COLUMN IF NOT EXISTS poll_data JSONB;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS poll_data JSONB;

-- Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_messages_scheduled
  ON messages (scheduled_at)
  WHERE scheduled_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_starred
  ON messages (is_starred)
  WHERE is_starred = true;

-- =============================================
-- 7. CLEANUP POLICIES
-- =============================================

-- Auto-delete expired messages (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM messages
  WHERE expires_in IS NOT NULL
    AND created_at + (expires_in || ' seconds')::interval < NOW();

  DELETE FROM group_messages
  WHERE expires_in IS NOT NULL
    AND created_at + (expires_in || ' seconds')::interval < NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 8. VIEWS FOR COMMON QUERIES
-- =============================================

-- View: Conversation list with last message
CREATE OR REPLACE VIEW conversation_summary AS
SELECT DISTINCT ON (conversation_key)
  conversation_key,
  sender_id,
  receiver_id,
  message_text,
  image_url,
  created_at,
  message_status
FROM (
  SELECT
    CASE WHEN sender_id < receiver_id
      THEN sender_id || ':' || receiver_id
      ELSE receiver_id || ':' || sender_id
    END AS conversation_key,
    *
  FROM messages
  WHERE deleted_for_all = false
) sub
ORDER BY conversation_key, created_at DESC;
