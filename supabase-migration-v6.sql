-- ============================================================
-- NodeTalk Migration v6: RLS Fixes & Automated Notifications
-- ============================================================

-- 1. MESSAGES: Add missing UPDATE policy for read receipts, edits, soft deletes
DROP POLICY IF EXISTS "Users can update their own sent or received messages" ON public.messages;
CREATE POLICY "Users can update their own sent or received messages"
  ON public.messages FOR UPDATE TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- 2. GROUP MESSAGES: Add missing UPDATE policy for edits, soft deletes, pins
DROP POLICY IF EXISTS "Members can update group messages" ON public.group_messages;
CREATE POLICY "Members can update group messages"
  ON public.group_messages FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_messages.group_id AND gm.user_id = auth.uid()
    )
  );

-- 3. NOTIFICATIONS TRIGGER FOR DM MESSAGES
-- Automatically insert a notification record whenever a direct message is sent
CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (
    NEW.receiver_id,
    'message',
    (SELECT username FROM public.profiles WHERE id = NEW.sender_id),
    COALESCE(NEW.message_text, '📷 Media attachment'),
    NEW.sender_id::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_message_created_notify ON public.messages;
CREATE TRIGGER on_message_created_notify
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_message_notification();

-- 4. NOTIFICATIONS TRIGGER FOR GROUP MESSAGES
-- Automatically insert notifications for all group members except the sender
CREATE OR REPLACE FUNCTION public.handle_new_group_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, link)
  SELECT
    gm.user_id,
    'group_message',
    (SELECT name FROM public.groups WHERE id = NEW.group_id),
    (SELECT username FROM public.profiles WHERE id = NEW.sender_id) || ': ' || COALESCE(NEW.message_text, '📷 Media attachment'),
    NEW.group_id::text
  FROM public.group_members gm
  WHERE gm.group_id = NEW.group_id
    AND gm.user_id != NEW.sender_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_group_message_created_notify ON public.group_messages;
CREATE TRIGGER on_group_message_created_notify
  AFTER INSERT ON public.group_messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_group_message_notification();

-- 5. ENABLE REALTIME ON MESSAGES AND NOTIFICATIONS
-- Ensure publication includes messages and notifications for realtime broadcast
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Handle gracefully if table already in publication
  NULL;
END $$;
