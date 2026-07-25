-- ============================================================
-- MIGRATION v4: Read receipts (WhatsApp-style)
-- ============================================================

-- 1. Add read_at timestamp
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- 2. Ensure message_status has all values (already has CHECK from v2)
-- Values: 'sending', 'sent', 'delivered', 'read'

-- 3. Index for batch mark-as-read queries
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(receiver_id, sender_id, message_status)
  WHERE message_status != 'read' AND message_status IS NOT NULL;
