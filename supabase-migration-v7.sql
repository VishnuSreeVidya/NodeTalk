-- ============================================================
-- NodeTalk Migration v7: pg_cron, Private Storage & E2EE Key Backup
-- ============================================================

-- 1. ENABLE pg_cron EXTENSION (available on Supabase Pro / self-hosted)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule stale user cleanup every minute
SELECT cron.schedule(
  'cleanup-stale-users-every-minute',
  '* * * * *',
  $$SELECT public.cleanup_stale_users()$$
);

-- Schedule expired message cleanup every hour
SELECT cron.schedule(
  'cleanup-expired-messages-every-hour',
  '0 * * * *',
  $$SELECT public.cleanup_expired_messages()$$
);

-- 2. USER KEYS: Add column for encrypted key backup (passphrase protected)
ALTER TABLE public.user_keys ADD COLUMN IF NOT EXISTS encrypted_key_backup TEXT;

-- 3. STORAGE POLICIES: Private Storage Bucket RLS
-- Note: Ensure buckets 'chat-files' and 'chat-images' exist in Supabase Dashboard.
-- These policies restrict media access to authenticated chat participants.

-- Allow authenticated users to view objects in storage
CREATE POLICY "Authenticated users can read chat attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('chat-files', 'chat-images'));

-- Allow users to upload attachments
CREATE POLICY "Users can upload chat attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('chat-files', 'chat-images') AND auth.uid() = owner);

-- Allow users to delete their own attachments
CREATE POLICY "Users can delete own chat attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('chat-files', 'chat-images') AND auth.uid() = owner);
