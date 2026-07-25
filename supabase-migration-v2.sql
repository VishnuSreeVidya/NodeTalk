-- ============================================================
-- MIGRATION: Add groups, attachments, notifications,
-- call_history, user_settings tables
-- ============================================================

-- 1. ATTACHMENTS TABLE (file sharing beyond images)
CREATE TABLE IF NOT EXISTS public.attachments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  BIGINT NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name   TEXT NOT NULL,
  file_type   TEXT NOT NULL DEFAULT 'file',
  file_size   BIGINT DEFAULT 0,
  file_url    TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attachments_message ON public.attachments(message_id);

-- 2. GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  avatar_url  TEXT,
  created_by  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_archived BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. GROUP MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.group_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  is_muted    BOOLEAN DEFAULT false,
  joined_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);

-- 4. GROUP MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.group_messages (
  id              BIGSERIAL PRIMARY KEY,
  group_id        UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_text    TEXT,
  image_url       TEXT,
  encrypted       BOOLEAN DEFAULT false,
  encrypted_text  TEXT,
  reply_to        BIGINT REFERENCES public.group_messages(id) ON DELETE SET NULL,
  is_pinned       BOOLEAN DEFAULT false,
  is_edited       BOOLEAN DEFAULT false,
  deleted_for_all BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_group_messages_group ON public.group_messages(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_messages_sender ON public.group_messages(sender_id);

-- 5. UPDATE messages TABLE (add missing columns for DM features)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS deleted_for_all BOOLEAN DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_status TEXT DEFAULT 'sent' CHECK (message_status IN ('sending', 'sent', 'delivered', 'read'));

-- 6. MESSAGE REACTIONS (rename existing if needed, or create new)
-- Already exists from previous migration

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT,
  body        TEXT,
  link        TEXT,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

-- 8. CALL HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.call_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caller_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  callee_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  call_type   TEXT NOT NULL DEFAULT 'audio' CHECK (call_type IN ('audio', 'video')),
  status      TEXT NOT NULL DEFAULT 'missed' CHECK (status IN ('missed', 'answered', 'declined', 'completed')),
  duration    INTEGER DEFAULT 0,
  started_at  TIMESTAMPTZ DEFAULT now(),
  ended_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_call_history_caller ON public.call_history(caller_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_history_callee ON public.call_history(callee_id, started_at DESC);

-- 9. USER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.user_settings (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_sound  BOOLEAN DEFAULT true,
  notification_browser BOOLEAN DEFAULT true,
  show_online_status  BOOLEAN DEFAULT true,
  show_last_seen      BOOLEAN DEFAULT true,
  read_receipts       BOOLEAN DEFAULT true,
  enter_to_send       BOOLEAN DEFAULT true,
  message_font_size   TEXT DEFAULT 'medium' CHECK (message_font_size IN ('small', 'medium', 'large')),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- 10. PINNED MESSAGES (for quick access)
CREATE TABLE IF NOT EXISTS public.pinned_messages (
  id          BIGSERIAL PRIMARY KEY,
  message_id  BIGINT NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  pinned_by   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pinned_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id)
);

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;

-- Attachments
CREATE POLICY "Users can read attachments for their messages" ON public.attachments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_id AND (m.sender_id = auth.uid() OR m.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert attachments" ON public.attachments
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Groups
CREATE POLICY "Users can view groups they belong to" ON public.groups
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create groups" ON public.groups
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can update groups" ON public.groups
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = id AND gm.user_id = auth.uid() AND gm.role = 'admin'
    )
  );

-- Group Members
CREATE POLICY "Members can view group members" ON public.group_members
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage members" ON public.group_members
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid() AND gm.role = 'admin'
    )
    OR group_members.user_id = auth.uid()
  );

CREATE POLICY "Admins can remove members" ON public.group_members
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid() AND gm.role = 'admin'
    )
    OR user_id = auth.uid()
  );

-- Group Messages
CREATE POLICY "Members can read group messages" ON public.group_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_messages.group_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can send group messages" ON public.group_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_messages.group_id AND gm.user_id = auth.uid()
    )
  );

-- Notifications
CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Call History
CREATE POLICY "Users can view own call history" ON public.call_history
  FOR SELECT TO authenticated
  USING (caller_id = auth.uid() OR callee_id = auth.uid());

CREATE POLICY "Users can insert call records" ON public.call_history
  FOR INSERT TO authenticated
  WITH CHECK (caller_id = auth.uid());

-- User Settings
CREATE POLICY "Users can read own settings" ON public.user_settings
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- Pinned Messages
CREATE POLICY "Users can view pinned messages" ON public.pinned_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_id AND (m.sender_id = auth.uid() OR m.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Users can pin messages" ON public.pinned_messages
  FOR INSERT TO authenticated
  WITH CHECK (pinned_by = auth.uid());

CREATE POLICY "Users can unpin messages" ON public.pinned_messages
  FOR DELETE TO authenticated
  USING (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages(message_status);
CREATE INDEX IF NOT EXISTS idx_messages_pinned ON public.messages(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_group_messages_pinned ON public.group_messages(is_pinned) WHERE is_pinned = true;

-- ============================================================
-- ENABLE REALTIME
-- ============================================================
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.attachments;

-- ============================================================
-- TRIGGER: Auto-create user_settings on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_settings (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_settings();

-- ============================================================
-- TRIGGER: Update group updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_group_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_group_update
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.update_group_timestamp();
