CREATE TABLE public.clinical_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_user_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  note TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clinical_notes_patient ON public.clinical_notes (patient_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinical_notes TO authenticated;
GRANT ALL ON public.clinical_notes TO service_role;

ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors manage their own clinical notes"
ON public.clinical_notes FOR ALL TO authenticated
USING (auth.uid() = doctor_user_id AND public.has_role(auth.uid(), 'doctor'))
WITH CHECK (auth.uid() = doctor_user_id AND public.has_role(auth.uid(), 'doctor'));

CREATE TRIGGER update_clinical_notes_updated_at
BEFORE UPDATE ON public.clinical_notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();