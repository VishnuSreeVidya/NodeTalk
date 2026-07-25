-- ============================================================
-- MIGRATION v3: Add file sharing columns + storage bucket
-- ============================================================

-- 1. Add file columns to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- 2. Add file columns to group_messages table
ALTER TABLE public.group_messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.group_messages ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.group_messages ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE public.group_messages ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- 3. Create storage bucket for files (run this in Supabase Dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('chat-files', 'chat-files', true)
-- on CONFLICT (id) DO NOTHING;

-- If chat-images bucket already exists, you can reuse it.
-- The FileUpload component uses IMAGE_BUCKET which is 'chat-images' by default.

-- 4. Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.notifications;
