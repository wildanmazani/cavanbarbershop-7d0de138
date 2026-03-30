-- Create members table
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  college_location TEXT NOT NULL,
  hair_concerns TEXT,
  stamps_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on phone number
CREATE UNIQUE INDEX idx_members_phone ON public.members (phone_number);

-- Enable RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (no auth required — members look up by phone)
CREATE POLICY "Anyone can register as a member"
  ON public.members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can look up a member by phone"
  ON public.members FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update stamp count"
  ON public.members FOR UPDATE
  USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();