-- Amrikyy Trips Database Schema
-- Run this in your Supabase SQL Editor

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trips table
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'ongoing', 'completed')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create destinations table
CREATE TABLE IF NOT EXISTS public.destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  image_url TEXT NOT NULL,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  price_range TEXT NOT NULL DEFAULT '$',
  best_time TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI conversations table
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON public.expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_destinations_rating ON public.destinations(rating);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for trips table
CREATE POLICY "Users can view own trips" ON public.trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips" ON public.trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" ON public.trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips" ON public.trips
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for expenses table
CREATE POLICY "Users can view own expenses" ON public.expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON public.expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON public.expenses
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for AI conversations table
CREATE POLICY "Users can view own conversations" ON public.ai_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON public.ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Destinations table is public (no RLS needed)
-- Everyone can read destinations

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample destinations
INSERT INTO public.destinations (name, country, image_url, rating, price_range, best_time, description) VALUES
('Tokyo', 'Japan', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', 4.8, '$$$', 'Mar-May, Sep-Nov', 'A vibrant metropolis blending traditional culture with cutting-edge technology.'),
('Paris', 'France', 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400', 4.9, '$$$$', 'Apr-Jun, Sep-Oct', 'The City of Light, famous for its art, fashion, and romantic atmosphere.'),
('Bali', 'Indonesia', 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400', 4.7, '$$', 'Apr-Oct', 'Tropical paradise with stunning beaches, temples, and lush landscapes.'),
('New York', 'USA', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400', 4.6, '$$$$', 'Apr-Jun, Sep-Nov', 'The city that never sleeps, offering endless entertainment and culture.'),
('Santorini', 'Greece', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400', 4.9, '$$$', 'May-Oct', 'Breathtaking sunsets, white-washed buildings, and crystal-clear waters.'),
('Dubai', 'UAE', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400', 4.5, '$$$', 'Nov-Mar', 'Ultra-modern city with world-class shopping, dining, and entertainment.');

-- ==========================================================
-- Telegram Profiles + Messages + Payments + Storage Bucket
-- ==========================================================

-- Create profiles table for Telegram users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS: Allow users to manage only their own profile based on JWT sub (Telegram id)
CREATE POLICY IF NOT EXISTS "Users manage own profile (telegram)" ON public.profiles
  FOR ALL
  USING (((current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::bigint) = telegram_id)
  WITH CHECK (((current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::bigint) = telegram_id);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own messages" ON public.messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own messages" ON public.messages
  FOR DELETE USING (auth.uid() = user_id);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created','pending','completed','failed','refunded')),
  stripe_session_id TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session_id ON public.payments(stripe_session_id);

CREATE POLICY IF NOT EXISTS "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own payments" ON public.payments
  FOR UPDATE USING (auth.uid() = user_id);

-- Storage bucket for avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
  ) THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', false);
  END IF;
END $$;

-- Allow users to manage their own objects in avatars bucket
CREATE POLICY IF NOT EXISTS "Avatar objects read own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatars' AND owner = auth.uid()
  );

CREATE POLICY IF NOT EXISTS "Avatar objects insert own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND owner = auth.uid()
  );

CREATE POLICY IF NOT EXISTS "Avatar objects update own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND owner = auth.uid()
  );

CREATE POLICY IF NOT EXISTS "Avatar objects delete own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND owner = auth.uid()
  );

-- Note: Public read via signed URLs does not require a public read policy
