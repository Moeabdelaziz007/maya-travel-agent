-- Enhanced AI Knowledge Base and User Profile System
-- Migration for comprehensive AI chatbot intelligence

-- Knowledge Base Tables
CREATE TABLE IF NOT EXISTS public.knowledge_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_category_id UUID REFERENCES public.knowledge_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.knowledge_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.knowledge_categories(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'en',
  country TEXT,
  city TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector embeddings for semantic search
CREATE TABLE IF NOT EXISTS public.knowledge_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.knowledge_articles(id) ON DELETE CASCADE,
  embedding_vector VECTOR(1536), -- OpenAI text-embedding-ada-002 dimensions
  model TEXT DEFAULT 'text-embedding-ada-002',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profile and Persona System
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES public.users(id) PRIMARY KEY,
  travel_style TEXT[] DEFAULT '{}', -- 'budget', 'luxury', 'adventure', 'cultural', 'relaxation'
  preferred_destinations TEXT[] DEFAULT '{}',
  budget_range TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'luxury'
  travel_frequency TEXT DEFAULT 'occasional', -- 'rare', 'occasional', 'frequent', 'constant'
  group_size TEXT DEFAULT 'solo', -- 'solo', 'couple', 'family', 'group'
  preferred_activities TEXT[] DEFAULT '{}',
  dietary_restrictions TEXT[] DEFAULT '{}',
  accessibility_needs TEXT[] DEFAULT '{}',
  language_preferences TEXT[] DEFAULT '{en}',
  cultural_interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_personas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  characteristics JSONB NOT NULL DEFAULT '{}',
  travel_patterns JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_persona_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES public.user_personas(id),
  confidence_score DECIMAL(3,2) DEFAULT 0.5, -- 0.0 to 1.0
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, persona_id)
);

-- Enhanced AI Conversation System
CREATE TABLE IF NOT EXISTS public.ai_conversation_context (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL, -- Thread/session identifier
  context_type TEXT NOT NULL, -- 'preferences', 'history', 'current_trip', 'long_term_memory'
  context_data JSONB NOT NULL,
  importance_score DECIMAL(3,2) DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_reasoning_traces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  reasoning_type TEXT NOT NULL, -- 'analysis', 'planning', 'recommendation', 'explanation'
  thought_process TEXT NOT NULL,
  evidence_used TEXT[] DEFAULT '{}',
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_travel_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  destination TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  budget_range TEXT NOT NULL,
  travel_style TEXT[] DEFAULT '{}',
  itinerary_data JSONB NOT NULL,
  reasoning_trace JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft', -- 'draft', 'confirmed', 'modified', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Behavior and Learning System
CREATE TABLE IF NOT EXISTS public.user_behavior_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'chat_message', 'destination_view', 'itinerary_request', 'feedback'
  interaction_data JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT
);

CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  conversation_id TEXT,
  feedback_type TEXT NOT NULL, -- 'thumbs_up', 'thumbs_down', 'rating', 'comment'
  feedback_data JSONB NOT NULL,
  ai_response_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_category ON public.knowledge_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_tags ON public.knowledge_articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_country ON public.knowledge_articles(country);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_city ON public.knowledge_articles(city);
CREATE INDEX IF NOT EXISTS idx_knowledge_embeddings_article ON public.knowledge_embeddings(article_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_travel_style ON public.user_profiles USING GIN(travel_style);
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferences ON public.user_profiles USING GIN(preferred_destinations);
CREATE INDEX IF NOT EXISTS idx_user_persona_assignments_user ON public.user_persona_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_persona_assignments_persona ON public.user_persona_assignments(persona_id);

CREATE INDEX IF NOT EXISTS idx_ai_conversation_context_user ON public.ai_conversation_context(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_context_conversation ON public.ai_conversation_context(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_reasoning_traces_conversation ON public.ai_reasoning_traces(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_travel_plans_user ON public.ai_travel_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_travel_plans_conversation ON public.ai_travel_plans(conversation_id);

CREATE INDEX IF NOT EXISTS idx_user_behavior_history_user ON public.user_behavior_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_history_type ON public.user_behavior_history(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_behavior_history_timestamp ON public.user_behavior_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user ON public.user_feedback(user_id);

-- Enable Row Level Security
ALTER TABLE public.knowledge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_persona_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversation_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_reasoning_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for knowledge base (public read access)
CREATE POLICY "Knowledge categories are publicly readable" ON public.knowledge_categories
  FOR SELECT USING (true);

CREATE POLICY "Knowledge articles are publicly readable" ON public.knowledge_articles
  FOR SELECT USING (true);

CREATE POLICY "Knowledge embeddings are publicly readable" ON public.knowledge_embeddings
  FOR SELECT USING (true);

-- RLS Policies for user profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user personas (public read for assignments)
CREATE POLICY "User personas are publicly readable" ON public.user_personas
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view own persona assignments" ON public.user_persona_assignments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own persona assignments" ON public.user_persona_assignments
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for AI conversation context
CREATE POLICY "Users can view own conversation context" ON public.ai_conversation_context
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversation context" ON public.ai_conversation_context
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversation context" ON public.ai_conversation_context
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversation context" ON public.ai_conversation_context
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for AI reasoning traces
CREATE POLICY "Users can view own reasoning traces" ON public.ai_reasoning_traces
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reasoning traces" ON public.ai_reasoning_traces
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for AI travel plans
CREATE POLICY "Users can view own travel plans" ON public.ai_travel_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own travel plans" ON public.ai_travel_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own travel plans" ON public.ai_travel_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own travel plans" ON public.ai_travel_plans
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user behavior history
CREATE POLICY "Users can view own behavior history" ON public.user_behavior_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own behavior history" ON public.user_behavior_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user feedback
CREATE POLICY "Users can view own feedback" ON public.user_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON public.user_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert default knowledge categories
INSERT INTO public.knowledge_categories (name, description) VALUES
('destinations', 'Information about travel destinations worldwide'),
('culture', 'Cultural insights and customs for different countries'),
('weather', 'Weather patterns and climate information'),
('safety', 'Safety advisories and travel warnings'),
('transportation', 'Transportation options and tips'),
('accommodation', 'Hotels, hostels, and accommodation guides'),
('food', 'Local cuisine and dining recommendations'),
('activities', 'Tourist activities and attractions'),
('budget', 'Budget planning and cost-saving tips'),
('health', 'Health and medical travel advice');

-- Insert default user personas
INSERT INTO public.user_personas (name, description, characteristics, travel_patterns) VALUES
('Budget Explorer', 'Travels on a tight budget, seeks authentic local experiences',
 '{"budget_conscious": true, "local_experiences": true, "adventure_level": "medium"}',
 '{"preferred_duration": "7-14_days", "group_size": "solo_or_small", "frequency": "2-3_per_year"}'),

('Luxury Seeker', 'Prefers high-end experiences and premium services',
 '{"luxury_focused": true, "comfort_priority": true, "exclusive_experiences": true}',
 '{"preferred_duration": "5-10_days", "group_size": "couple_or_small", "frequency": "4-6_per_year"}'),

('Adventure Enthusiast', 'Seeks thrilling experiences and outdoor activities',
 '{"adventure_level": "high", "outdoor_activities": true, "physical_challenge": true}',
 '{"preferred_duration": "10-21_days", "group_size": "small_group", "frequency": "3-4_per_year"}'),

('Cultural Immersion', 'Focuses on learning about local culture and history',
 '{"cultural_focus": true, "educational_travel": true, "local_interaction": true}',
 '{"preferred_duration": "14-30_days", "group_size": "solo_or_couple", "frequency": "1-2_per_year"}'),

('Family Traveler', 'Travels with family, prioritizes kid-friendly activities',
 '{"family_oriented": true, "child_friendly": true, "educational_value": true}',
 '{"preferred_duration": "7-14_days", "group_size": "family", "frequency": "1-2_per_year"}');

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();