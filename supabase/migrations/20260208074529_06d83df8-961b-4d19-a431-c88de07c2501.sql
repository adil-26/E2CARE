
-- ============================================
-- Vitals table: store vital readings over time
-- ============================================
CREATE TABLE public.vitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vital_type TEXT NOT NULL, -- 'blood_pressure', 'heart_rate', 'blood_sugar', 'bmi', 'spo2', 'temperature'
  value TEXT NOT NULL, -- e.g. "120/80" for BP, "72" for HR
  unit TEXT NOT NULL, -- e.g. "mmHg", "bpm", "mg/dL"
  status TEXT NOT NULL DEFAULT 'normal', -- 'normal', 'attention', 'critical'
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vitals"
  ON public.vitals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vitals"
  ON public.vitals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vitals"
  ON public.vitals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vitals"
  ON public.vitals FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_vitals_user_type ON public.vitals(user_id, vital_type, recorded_at DESC);

-- ============================================
-- Daily routines: track daily health habits
-- ============================================
CREATE TABLE public.daily_routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  routine_date DATE NOT NULL DEFAULT CURRENT_DATE,
  water_glasses INTEGER NOT NULL DEFAULT 0,
  sleep_hours NUMERIC(4,1) NOT NULL DEFAULT 0,
  steps INTEGER NOT NULL DEFAULT 0,
  exercise_minutes INTEGER NOT NULL DEFAULT 0,
  calories_consumed INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, routine_date)
);

ALTER TABLE public.daily_routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own routines"
  ON public.daily_routines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routines"
  ON public.daily_routines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines"
  ON public.daily_routines FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_daily_routines_updated_at
  BEFORE UPDATE ON public.daily_routines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Medications: store active medications
-- ============================================
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL, -- e.g. "500mg"
  frequency TEXT NOT NULL, -- e.g. "twice daily"
  schedule JSONB DEFAULT '[]'::jsonb, -- e.g. ["morning", "night"]
  prescribed_by TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medications"
  ON public.medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medications"
  ON public.medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medications"
  ON public.medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medications"
  ON public.medications FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON public.medications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_medications_user_active ON public.medications(user_id, is_active);
