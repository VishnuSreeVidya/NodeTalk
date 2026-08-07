-- ============================================================
-- NodeTalk Migration v9: Delete for Me & Delete for Everyone
-- ============================================================

-- 1. DM MESSAGE DELETIONS TABLE (Delete for Me)
CREATE TABLE IF NOT EXISTS public.message_deletions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  BIGINT NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  deleted_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_deletions_user ON public.message_deletions(user_id, message_id);

-- 2. GROUP MESSAGE DELETIONS TABLE (Delete for Me in Groups)
CREATE TABLE IF NOT EXISTS public.group_message_deletions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_message_id BIGINT NOT NULL REFERENCES public.group_messages(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  deleted_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_message_deletions_user ON public.group_message_deletions(user_id, group_message_id);

-- 3. ENABLE RLS ON DELETION TABLES
ALTER TABLE public.message_deletions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_message_deletions ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR DM MESSAGE DELETIONS
DROP POLICY IF EXISTS "Users can view own DM deletions" ON public.message_deletions;
CREATE POLICY "Users can view own DM deletions" ON public.message_deletions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own DM deletions" ON public.message_deletions;
CREATE POLICY "Users can insert own DM deletions" ON public.message_deletions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own DM deletions" ON public.message_deletions;
CREATE POLICY "Users can update own DM deletions" ON public.message_deletions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- 5. RLS POLICIES FOR GROUP MESSAGE DELETIONS
DROP POLICY IF EXISTS "Users can view own group deletions" ON public.group_message_deletions;
CREATE POLICY "Users can view own group deletions" ON public.group_message_deletions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own group deletions" ON public.group_message_deletions;
CREATE POLICY "Users can insert own group deletions" ON public.group_message_deletions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own group deletions" ON public.group_message_deletions;
CREATE POLICY "Users can update own group deletions" ON public.group_message_deletions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- 6. RLS POLICIES FOR DELETE FOR EVERYONE ON MESSAGES
DROP POLICY IF EXISTS "Senders can delete for everyone in DMs" ON public.messages;
CREATE POLICY "Senders can delete for everyone in DMs" ON public.messages
  FOR UPDATE TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- 7. RLS POLICIES FOR DELETE FOR EVERYONE ON GROUP MESSAGES
DROP POLICY IF EXISTS "Senders and admins can delete for everyone in groups" ON public.group_messages;
CREATE POLICY "Senders and admins can delete for everyone in groups" ON public.group_messages
  FOR UPDATE TO authenticated
  USING (
    sender_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_messages.group_id
        AND gm.user_id = auth.uid()
        AND gm.role = 'admin'
    )
  )
  WITH CHECK (
    sender_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_messages.group_id
        AND gm.user_id = auth.uid()
        AND gm.role = 'admin'
    )
  );
