
-- ============================================
-- Medical History: stores wizard data as JSONB per step
-- ============================================
CREATE TABLE public.medical_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_step INTEGER NOT NULL DEFAULT 1,

  -- Step 1: Birth History
  birth_history JSONB DEFAULT '{}'::jsonb,
  -- Step 2: Childhood Illnesses
  childhood_illnesses JSONB DEFAULT '{}'::jsonb,
  -- Step 3: Family Medical History
  family_history JSONB DEFAULT '{}'::jsonb,
  -- Step 4: Gender-specific Health
  gender_health JSONB DEFAULT '{}'::jsonb,
  -- Step 5: Surgeries & Hospitalizations
  surgeries JSONB DEFAULT '{}'::jsonb,
  -- Step 6: Allergies
  allergies JSONB DEFAULT '{}'::jsonb,
  -- Step 7: Lifestyle & Habits
  lifestyle JSONB DEFAULT '{}'::jsonb,

  is_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medical history"
  ON public.medical_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medical history"
  ON public.medical_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medical history"
  ON public.medical_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_medical_history_updated_at
  BEFORE UPDATE ON public.medical_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
