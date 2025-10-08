-- Create enum for subscription status
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'cancelled', 'expired');

-- Create enum for conversation channel
CREATE TYPE conversation_channel AS ENUM ('whatsapp', 'telegram', 'web');

-- User profiles with rich travel preferences (enhanced)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_id TEXT UNIQUE,
  whatsapp_phone TEXT UNIQUE,
  full_name TEXT,
  email TEXT,
  preferred_language TEXT DEFAULT 'en',
  
  -- Travel preferences for personalization
  favorite_destinations TEXT[],
  travel_style TEXT[], -- adventure, luxury, budget, cultural, etc.
  budget_range TEXT,
  dietary_preferences TEXT[],
  
  -- Subscription info
  subscription_status subscription_status DEFAULT 'trial',
  subscription_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  trial_messages_used INTEGER DEFAULT 0,
  trial_messages_limit INTEGER DEFAULT 10,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation history for context and analytics
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  channel conversation_channel NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  
  -- Extracted intelligence
  detected_preferences JSONB, -- destinations, budget, dates extracted from conversation
  trip_intent TEXT, -- planning, booking, exploring, etc.
  sentiment TEXT, -- positive, neutral, negative
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip plans created through conversations
CREATE TABLE IF NOT EXISTS public.ai_generated_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  budget NUMERIC,
  travelers_count INTEGER DEFAULT 1,
  
  itinerary JSONB, -- AI-generated day-by-day plan
  preferences JSONB, -- activities, food, accommodation preferences
  booking_status TEXT DEFAULT 'planned', -- planned, booked, completed
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment transactions for transparency
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp-specific table for phone number mapping
CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert profiles"
  ON public.user_profiles FOR INSERT
  WITH CHECK (true);

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  USING (user_profile_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can manage conversations"
  ON public.conversations FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for ai_generated_trips
CREATE POLICY "Users can view their own trips"
  ON public.ai_generated_trips FOR SELECT
  USING (user_profile_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own trips"
  ON public.ai_generated_trips FOR INSERT
  WITH CHECK (user_profile_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own trips"
  ON public.ai_generated_trips FOR UPDATE
  USING (user_profile_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

-- RLS Policies for payment_transactions
CREATE POLICY "Users can view their own transactions"
  ON public.payment_transactions FOR SELECT
  USING (user_profile_id IN (SELECT id FROM public.user_profiles WHERE user_id = auth.uid()));

-- RLS Policies for whatsapp_conversations (service role only)
CREATE POLICY "Service role can manage WhatsApp conversations"
  ON public.whatsapp_conversations FOR ALL
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_user_profiles_telegram ON public.user_profiles(telegram_id);
CREATE INDEX idx_user_profiles_whatsapp ON public.user_profiles(whatsapp_phone);
CREATE INDEX idx_user_profiles_stripe ON public.user_profiles(stripe_customer_id);
CREATE INDEX idx_conversations_user ON public.conversations(user_profile_id);
CREATE INDEX idx_whatsapp_phone ON public.whatsapp_conversations(phone_number);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_generated_trips_updated_at
  BEFORE UPDATE ON public.ai_generated_trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();