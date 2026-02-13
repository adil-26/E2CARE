-- Fix conversations RLS: allow doctors to see their conversations too
DROP POLICY IF EXISTS "Patients can view own conversations" ON public.conversations;
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() IN (
    SELECT d.user_id FROM doctors d WHERE d.id = conversations.doctor_id AND d.user_id IS NOT NULL
  ));

DROP POLICY IF EXISTS "Patients can update own conversations" ON public.conversations;
CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = patient_id OR auth.uid() IN (
    SELECT d.user_id FROM doctors d WHERE d.id = conversations.doctor_id AND d.user_id IS NOT NULL
  ));

-- Allow doctors to create conversations too
DROP POLICY IF EXISTS "Patients can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = patient_id OR auth.uid() IN (
    SELECT d.user_id FROM doctors d WHERE d.id = conversations.doctor_id AND d.user_id IS NOT NULL
  ));

-- Fix messages RLS: allow doctors to view messages in their conversations
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.messages;
CREATE POLICY "Users can view messages in own conversations"
  ON public.messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (
      c.patient_id = auth.uid()
      OR auth.uid() IN (SELECT d.user_id FROM doctors d WHERE d.id = c.doctor_id AND d.user_id IS NOT NULL)
    )
  ));

-- Fix messages RLS: allow doctors to send messages  
DROP POLICY IF EXISTS "Users can send messages in own conversations" ON public.messages;
CREATE POLICY "Users can send messages in own conversations"
  ON public.messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (
      c.patient_id = auth.uid()
      OR auth.uid() IN (SELECT d.user_id FROM doctors d WHERE d.id = c.doctor_id AND d.user_id IS NOT NULL)
    )
  ));

-- Fix call_logs RLS: allow doctors to view call logs
DROP POLICY IF EXISTS "Users can view call logs in own conversations" ON public.call_logs;
CREATE POLICY "Users can view call logs in own conversations"
  ON public.call_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = call_logs.conversation_id
    AND (
      c.patient_id = auth.uid()
      OR auth.uid() IN (SELECT d.user_id FROM doctors d WHERE d.id = c.doctor_id AND d.user_id IS NOT NULL)
    )
  ));

-- Fix call_logs RLS: allow doctors to insert call logs
DROP POLICY IF EXISTS "Users can insert call logs in own conversations" ON public.call_logs;
CREATE POLICY "Users can insert call logs in own conversations"
  ON public.call_logs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = call_logs.conversation_id
    AND (
      c.patient_id = auth.uid()
      OR auth.uid() IN (SELECT d.user_id FROM doctors d WHERE d.id = c.doctor_id AND d.user_id IS NOT NULL)
    )
  ));

-- Fix call_logs RLS: allow doctors to update call logs
DROP POLICY IF EXISTS "Users can update call logs in own conversations" ON public.call_logs;
CREATE POLICY "Users can update call logs in own conversations"
  ON public.call_logs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = call_logs.conversation_id
    AND (
      c.patient_id = auth.uid()
      OR auth.uid() IN (SELECT d.user_id FROM doctors d WHERE d.id = c.doctor_id AND d.user_id IS NOT NULL)
    )
  ));