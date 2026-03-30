
-- Add new columns to members
ALTER TABLE members ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE members ADD COLUMN avatar_url text;
ALTER TABLE members ADD COLUMN points_balance integer NOT NULL DEFAULT 0;
ALTER TABLE members ADD COLUMN referral_code text UNIQUE;

CREATE UNIQUE INDEX idx_members_user_id ON members(user_id);

-- Generate referral code trigger
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := upper(substr(md5(random()::text), 1, 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_referral_code BEFORE INSERT ON members FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

-- Favourite haircuts table
CREATE TABLE public.favourite_haircuts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  title text,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.favourite_haircuts ENABLE ROW LEVEL SECURITY;

-- Visits table
CREATE TABLE public.visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
  service text NOT NULL DEFAULT 'Haircut',
  notes text,
  points_earned integer DEFAULT 10,
  visited_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- Referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_email text NOT NULL,
  referred_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  bonus_points integer DEFAULT 50,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('haircuts', 'haircuts', true);

-- Drop old open RLS policies on members
DROP POLICY IF EXISTS "Anyone can look up a member by phone" ON members;
DROP POLICY IF EXISTS "Anyone can register as a member" ON members;
DROP POLICY IF EXISTS "Anyone can update stamps_count only" ON members;

-- New auth-based RLS for members
CREATE POLICY "Users can view own member record" ON members FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own member record" ON members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own member record" ON members FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS for favourite_haircuts
CREATE POLICY "Users can view own favourites" ON favourite_haircuts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favourites" ON favourite_haircuts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favourites" ON favourite_haircuts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS for visits
CREATE POLICY "Users can view own visits" ON visits FOR SELECT TO authenticated USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));

-- RLS for referrals
CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id);
CREATE POLICY "Users can create referrals" ON referrals FOR INSERT TO authenticated WITH CHECK (auth.uid() = referrer_id);

-- Storage RLS
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');
CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can upload haircuts" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'haircuts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Anyone can view haircuts" ON storage.objects FOR SELECT TO public USING (bucket_id = 'haircuts');
CREATE POLICY "Users can delete own haircuts" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'haircuts' AND (storage.foldername(name))[1] = auth.uid()::text);
