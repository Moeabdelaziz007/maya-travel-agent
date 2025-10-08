-- Create table for WhatsApp conversations
CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  messages JSONB DEFAULT '[]'::jsonb,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access (used by edge function)
CREATE POLICY "Service role can manage all conversations"
  ON public.whatsapp_conversations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_whatsapp_conversations_updated_at
  BEFORE UPDATE ON public.whatsapp_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster phone number lookups
CREATE INDEX idx_whatsapp_phone_number ON public.whatsapp_conversations(phone_number);