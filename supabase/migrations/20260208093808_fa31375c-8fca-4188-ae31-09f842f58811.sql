
-- ============================================
-- 1. Role system
-- ============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'patient');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 2. Link doctors to auth users
-- ============================================
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) UNIQUE;

-- ============================================
-- 3. Prescriptions
-- ============================================
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id),
  patient_id UUID NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id),
  diagnosis TEXT,
  notes TEXT,
  medicines JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own prescriptions"
ON public.prescriptions FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can manage own prescriptions"
ON public.prescriptions FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.id = prescriptions.doctor_id AND d.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.doctors d
    WHERE d.id = prescriptions.doctor_id AND d.user_id = auth.uid()
  )
);

CREATE TRIGGER update_prescriptions_updated_at
BEFORE UPDATE ON public.prescriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 4. Notifications
-- ============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated can create notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================
-- 5. Referrals
-- ============================================
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referred_email TEXT NOT NULL,
  referred_user_id UUID,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reward_amount INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals"
ON public.referrals FOR SELECT
TO authenticated
USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create referrals"
ON public.referrals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = referrer_id);

-- ============================================
-- 6. Wallet transactions
-- ============================================
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL DEFAULT 'credit',
  description TEXT NOT NULL,
  reference_id TEXT,
  balance_after INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
ON public.wallet_transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated can create transactions"
ON public.wallet_transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 7. Condition tracking logs
-- ============================================
CREATE TABLE public.condition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  condition_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.condition_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own condition logs"
ON public.condition_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own condition logs"
ON public.condition_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own condition logs"
ON public.condition_logs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own condition logs"
ON public.condition_logs FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- 8. Doctor access policies for patient data
-- ============================================
CREATE POLICY "Doctors can view patient profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'doctor')
  AND user_id IN (
    SELECT a.user_id FROM public.appointments a
    JOIN public.doctors d ON d.id = a.doctor_id
    WHERE d.user_id = auth.uid()
  )
);

CREATE POLICY "Doctors can view patient vitals"
ON public.vitals FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'doctor')
  AND user_id IN (
    SELECT a.user_id FROM public.appointments a
    JOIN public.doctors d ON d.id = a.doctor_id
    WHERE d.user_id = auth.uid()
  )
);

CREATE POLICY "Doctors can view patient medical history"
ON public.medical_history FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'doctor')
  AND user_id IN (
    SELECT a.user_id FROM public.appointments a
    JOIN public.doctors d ON d.id = a.doctor_id
    WHERE d.user_id = auth.uid()
  )
);

CREATE POLICY "Doctors can view patient medications"
ON public.medications FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'doctor')
  AND user_id IN (
    SELECT a.user_id FROM public.appointments a
    JOIN public.doctors d ON d.id = a.doctor_id
    WHERE d.user_id = auth.uid()
  )
);

CREATE POLICY "Doctors can view patient reports"
ON public.medical_reports FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'doctor')
  AND user_id IN (
    SELECT a.user_id FROM public.appointments a
    JOIN public.doctors d ON d.id = a.doctor_id
    WHERE d.user_id = auth.uid()
  )
);

CREATE POLICY "Doctors can view patient condition logs"
ON public.condition_logs FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'doctor')
  AND user_id IN (
    SELECT a.user_id FROM public.appointments a
    JOIN public.doctors d ON d.id = a.doctor_id
    WHERE d.user_id = auth.uid()
  )
);

-- Doctors can manage appointments
CREATE POLICY "Doctors can view their appointments"
ON public.appointments FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'doctor')
  AND doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
);

CREATE POLICY "Doctors can update their appointments"
ON public.appointments FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'doctor')
  AND doctor_id IN (SELECT id FROM public.doctors WHERE user_id = auth.uid())
);

-- ============================================
-- 9. Admin access policies
-- ============================================
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all doctors"
ON public.doctors FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all appointments"
ON public.appointments FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all prescriptions"
ON public.prescriptions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all condition logs"
ON public.condition_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all vitals"
ON public.vitals FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all medical reports"
ON public.medical_reports FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all medical history"
ON public.medical_history FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all medications"
ON public.medications FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all user roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 10. Auto-assign patient role on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'patient');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_role();

-- Add referral_code to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT DEFAULT substr(md5(random()::text), 1, 8);
