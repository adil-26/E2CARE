
-- Call logs table to track call history
CREATE TABLE public.call_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  caller_id UUID NOT NULL,
  call_type TEXT NOT NULL DEFAULT 'audio',
  status TEXT NOT NULL DEFAULT 'missed',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view call logs in own conversations"
  ON public.call_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = call_logs.conversation_id
    AND conversations.patient_id = auth.uid()
  ));

CREATE POLICY "Users can insert call logs in own conversations"
  ON public.call_logs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = call_logs.conversation_id
    AND conversations.patient_id = auth.uid()
  ));

CREATE POLICY "Users can update call logs in own conversations"
  ON public.call_logs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = call_logs.conversation_id
    AND conversations.patient_id = auth.uid()
  ));

CREATE INDEX idx_call_logs_conversation ON public.call_logs(conversation_id);

-- Add attachment columns to messages table
ALTER TABLE public.messages
  ADD COLUMN attachment_url TEXT,
  ADD COLUMN attachment_type TEXT,
  ADD COLUMN attachment_name TEXT;

-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('chat-attachments', 'chat-attachments', true, 10485760);

-- Storage policies for chat attachments
CREATE POLICY "Authenticated users can upload chat attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'chat-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view chat attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-attachments');

CREATE POLICY "Users can delete own chat attachments"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
