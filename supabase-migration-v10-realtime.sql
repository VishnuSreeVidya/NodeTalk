-- ============================================================
-- NodeTalk Migration v10: Failsafe Realtime & Replica Identity Script
-- Checks if table exists and catches duplicate publication errors
-- ============================================================

DO $$
BEGIN
  -- 1. messages table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    ALTER TABLE public.messages REPLICA IDENTITY FULL;
  END IF;

  -- 2. group_messages table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'group_messages') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    ALTER TABLE public.group_messages REPLICA IDENTITY FULL;
  END IF;

  -- 3. reactions table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reactions') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    ALTER TABLE public.reactions REPLICA IDENTITY FULL;
  END IF;

  -- 4. message_deletions table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'message_deletions') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.message_deletions;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    ALTER TABLE public.message_deletions REPLICA IDENTITY FULL;
  END IF;

  -- 5. group_message_deletions table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'group_message_deletions') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.group_message_deletions;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    ALTER TABLE public.group_message_deletions REPLICA IDENTITY FULL;
  END IF;

  -- 6. profiles table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    ALTER TABLE public.profiles REPLICA IDENTITY FULL;
  END IF;

  -- 7. notifications table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    ALTER TABLE public.notifications REPLICA IDENTITY FULL;
  END IF;
END $$;
