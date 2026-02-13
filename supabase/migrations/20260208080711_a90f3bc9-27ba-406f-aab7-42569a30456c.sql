-- Add new JSONB columns for medical conditions and body systems
ALTER TABLE public.medical_history 
ADD COLUMN IF NOT EXISTS medical_conditions jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS body_systems jsonb DEFAULT '{}'::jsonb;