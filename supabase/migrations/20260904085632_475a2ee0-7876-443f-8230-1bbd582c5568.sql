CREATE TABLE public.diet_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  title text NOT NULL,
  goal text,
  meals jsonb NOT NULL DEFAULT '[]'::jsonb,
  guidelines jsonb NOT NULL DEFAULT '{"include":[],"avoid":[]}'::jsonb,
  water_target_glasses integer NOT NULL DEFAULT 8,
  calorie_target integer,
  ai_generated boolean NOT NULL DEFAULT false,
  ai_rationale text,
  status text NOT NULL DEFAULT 'active',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.diet_plans TO authenticated;
GRANT ALL ON public.diet_plans TO service_role;

ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own diet plans"
ON public.diet_plans FOR SELECT TO authenticated
USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view diet plans they authored"
ON public.diet_plans FOR SELECT TO authenticated
USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create diet plans"
ON public.diet_plans FOR INSERT TO authenticated
WITH CHECK (auth.uid() = doctor_id AND public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Doctors can update their diet plans"
ON public.diet_plans FOR UPDATE TO authenticated
USING (auth.uid() = doctor_id) WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can delete their diet plans"
ON public.diet_plans FOR DELETE TO authenticated
USING (auth.uid() = doctor_id);

CREATE POLICY "Admins can view all diet plans"
ON public.diet_plans FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_diet_plans_updated_at
BEFORE UPDATE ON public.diet_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_diet_plans_patient ON public.diet_plans (patient_id, created_at DESC);
CREATE INDEX idx_diet_plans_doctor ON public.diet_plans (doctor_id, created_at DESC);