-- ============================================================
-- SUPABASE SQL SCHEMA — Full-Stack Realtime Chat Application
-- ============================================================

-- 1. PROFILES TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE NOT NULL,
  avatar_url    TEXT,
  bio           TEXT,
  status_message TEXT DEFAULT 'Hey there! I am using NodeTalk.',
  is_online     BOOLEAN DEFAULT false,
  current_theme TEXT DEFAULT 'glass-dark',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id          BIGSERIAL PRIMARY KEY,
  sender_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_text TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver
  ON public.messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at
  ON public.messages(created_at DESC);

-- 4. AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    NULL
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles: authenticated users can read all profiles, update only their own
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Messages: users can read messages they sent or received, insert their own
CREATE POLICY "Users can read their own messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can insert their own messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- 6. ENABLE REALTIME (run in Supabase SQL editor)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 7. STORAGE BUCKET SETUP (run separately in Supabase Storage dashboard)
-- Create a public bucket called "chat-images" via Supabase Dashboard > Storage
-- OR run:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('chat-images', 'chat-images', true);
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'chat-images');
-- CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'chat-images');
