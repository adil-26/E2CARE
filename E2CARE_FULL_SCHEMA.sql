-- ================================================================
-- E2CARE - COMPLETE DATABASE SCHEMA
-- Run this in your external Supabase project's SQL Editor
-- Order matters: run top to bottom
-- ================================================================

-- ============================================
-- 1. HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_own_profile(profile_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = profile_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- 2. PROFILES TABLE
-- ============================================

CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  blood_group TEXT CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  phone TEXT,
  address TEXT,
  profile_photo_url TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_id TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 6),
  pin_code TEXT DEFAULT lpad(floor(random() * 1000000)::text, 6, '0'),
  referral_code TEXT DEFAULT substr(md5(random()::text), 1, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (public.is_own_profile(user_id));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (public.is_own_profile(user_id));

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Emergency access by medical_id"
  ON public.profiles FOR SELECT
  TO anon
  USING (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 3. ROLE SYSTEM
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

CREATE POLICY "Admins can view all user roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Auto-assign patient role on signup
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

-- ============================================
-- 4. VITALS TABLE
-- ============================================

CREATE TABLE public.vitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vital_type TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'normal',
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vitals"
  ON public.vitals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vitals"
  ON public.vitals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vitals"
  ON public.vitals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vitals"
  ON public.vitals FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_vitals_user_type ON public.vitals(user_id, vital_type, recorded_at DESC);

-- ============================================
-- 5. DAILY ROUTINES
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
  ON public.daily_routines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own routines"
  ON public.daily_routines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own routines"
  ON public.daily_routines FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_daily_routines_updated_at
  BEFORE UPDATE ON public.daily_routines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 6. MEDICATIONS
-- ============================================

CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  schedule JSONB DEFAULT '[]'::jsonb,
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
  ON public.medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medications"
  ON public.medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own medications"
  ON public.medications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own medications"
  ON public.medications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Emergency access medications"
  ON public.medications FOR SELECT TO anon USING (is_active = true);

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_medications_user_active ON public.medications(user_id, is_active);

-- ============================================
-- 7. MEDICAL HISTORY
-- ============================================

CREATE TABLE public.medical_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_step INTEGER NOT NULL DEFAULT 1,
  birth_history JSONB DEFAULT '{}'::jsonb,
  childhood_illnesses JSONB DEFAULT '{}'::jsonb,
  family_history JSONB DEFAULT '{}'::jsonb,
  gender_health JSONB DEFAULT '{}'::jsonb,
  surgeries JSONB DEFAULT '{}'::jsonb,
  allergies JSONB DEFAULT '{}'::jsonb,
  lifestyle JSONB DEFAULT '{}'::jsonb,
  medical_conditions JSONB DEFAULT '{}'::jsonb,
  body_systems JSONB DEFAULT '{}'::jsonb,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medical history"
  ON public.medical_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medical history"
  ON public.medical_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own medical history"
  ON public.medical_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Emergency access medical history"
  ON public.medical_history FOR SELECT TO anon USING (true);

CREATE TRIGGER update_medical_history_updated_at
  BEFORE UPDATE ON public.medical_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 8. MEDICAL REPORTS
-- ============================================

CREATE TABLE public.medical_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'lab',
  report_date DATE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  extracted_data JSONB,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
  ON public.medical_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reports"
  ON public.medical_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reports"
  ON public.medical_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reports"
  ON public.medical_reports FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_medical_reports_updated_at
  BEFORE UPDATE ON public.medical_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 9. DOCTORS
-- ============================================

CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  full_name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  qualification TEXT,
  experience_years INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 4.0,
  consultation_fee INTEGER NOT NULL DEFAULT 500,
  avatar_url TEXT,
  bio TEXT,
  hospital TEXT,
  languages TEXT[] DEFAULT '{"English"}',
  is_available BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'approved',
  license_number TEXT,
  license_url TEXT,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view doctors"
  ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Users can view own doctor profile"
  ON public.doctors FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can register as doctor"
  ON public.doctors FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Doctors can update own profile"
  ON public.doctors FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status = 'approved');
CREATE POLICY "Admins can manage all doctors"
  ON public.doctors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 10. DOCTOR AVAILABILITY
-- ============================================

CREATE TABLE public.doctor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view availability"
  ON public.doctor_availability FOR SELECT USING (true);

-- ============================================
-- 11. APPOINTMENTS
-- ============================================

CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled', 'no_show')),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments"
  ON public.appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own appointments"
  ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own appointments"
  ON public.appointments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own appointments"
  ON public.appointments FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 12. CONVERSATIONS & MESSAGES
-- ============================================

CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, doctor_id)
);

CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL DEFAULT 'patient' CHECK (sender_type IN ('patient', 'doctor')),
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  attachment_url TEXT,
  attachment_type TEXT,
  attachment_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() IN (
    SELECT d.user_id FROM doctors d WHERE d.id = conversations.doctor_id AND d.user_id IS NOT NULL
  ));

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = patient_id OR auth.uid() IN (
    SELECT d.user_id FROM doctors d WHERE d.id = conversations.doctor_id AND d.user_id IS NOT NULL
  ));

CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = patient_id OR auth.uid() IN (
    SELECT d.user_id FROM doctors d WHERE d.id = conversations.doctor_id AND d.user_id IS NOT NULL
  ));

CREATE POLICY "Users can view messages in own conversations"
  ON public.messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.patient_id = auth.uid() OR auth.uid() IN (
      SELECT d.user_id FROM doctors d WHERE d.id = c.doctor_id AND d.user_id IS NOT NULL
    ))
  ));

CREATE POLICY "Users can send messages in own conversations"
  ON public.messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.patient_id = auth.uid() OR auth.uid() IN (
      SELECT d.user_id FROM doctors d WHERE d.id = c.doctor_id AND d.user_id IS NOT NULL
    ))
  ));

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id, created_at);
CREATE INDEX idx_conversations_patient_id ON public.conversations(patient_id);

-- ============================================
-- 13. CALL LOGS
-- ============================================

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
    SELECT 1 FROM conversations c WHERE c.id = call_logs.conversation_id
    AND (c.patient_id = auth.uid() OR auth.uid() IN (
      SELECT d.user_id FROM doctors d WHERE d.id = c.doctor_id AND d.user_id IS NOT NULL
    ))
  ));

CREATE POLICY "Users can insert call logs in own conversations"
  ON public.call_logs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM conversations c WHERE c.id = call_logs.conversation_id
    AND (c.patient_id = auth.uid() OR auth.uid() IN (
      SELECT d.user_id FROM doctors d WHERE d.id = c.doctor_id AND d.user_id IS NOT NULL
    ))
  ));

CREATE POLICY "Users can update call logs in own conversations"
  ON public.call_logs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM conversations c WHERE c.id = call_logs.conversation_id
    AND (c.patient_id = auth.uid() OR auth.uid() IN (
      SELECT d.user_id FROM doctors d WHERE d.id = c.doctor_id AND d.user_id IS NOT NULL
    ))
  ));

CREATE INDEX idx_call_logs_conversation ON public.call_logs(conversation_id);

-- ============================================
-- 14. PRESCRIPTIONS
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
  ON public.prescriptions FOR SELECT TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can manage own prescriptions"
  ON public.prescriptions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = prescriptions.doctor_id AND d.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = prescriptions.doctor_id AND d.user_id = auth.uid()));

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 15. NOTIFICATIONS
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
  ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated can create notifications"
  ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- 16. REFERRALS
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
  ON public.referrals FOR SELECT TO authenticated USING (auth.uid() = referrer_id);
CREATE POLICY "Users can create referrals"
  ON public.referrals FOR INSERT TO authenticated WITH CHECK (auth.uid() = referrer_id);

-- ============================================
-- 17. WALLET TRANSACTIONS
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
  ON public.wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated can create transactions"
  ON public.wallet_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 18. CONDITION LOGS
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
  ON public.condition_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own condition logs"
  ON public.condition_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own condition logs"
  ON public.condition_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own condition logs"
  ON public.condition_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- 19. DOCTOR ACCESS POLICIES (cross-table)
-- ============================================

CREATE POLICY "Doctors can view patient profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') AND user_id IN (
    SELECT a.user_id FROM public.appointments a JOIN public.doctors d ON d.id = a.doctor_id WHERE d.user_id = auth.uid()
  ));

CREATE POLICY "Doctors can view patient vitals"
  ON public.vitals FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') AND user_id IN (
    SELECT a.user_id FROM public.appointments a JOIN public.doctors d ON d.id = a.doctor_id WHERE d.user_id = auth.uid()
  ));

CREATE POLICY "Doctors can view patient medical history"
  ON public.medical_history FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') AND user_id IN (
    SELECT a.user_id FROM public.appointments a JOIN public.doctors d ON d.id = a.doctor_id WHERE d.user_id = auth.uid()
  ));

CREATE POLICY "Doctors can view patient medications"
  ON public.medications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') AND user_id IN (
    SELECT a.user_id FROM public.appointments a JOIN public.doctors d ON d.id = a.doctor_id WHERE d.user_id = auth.uid()
  ));

CREATE POLICY "Doctors can view patient reports"
  ON public.medical_reports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') AND user_id IN (
    SELECT a.user_id FROM public.appointments a JOIN public.doctors d ON d.id = a.doctor_id WHERE d.user_id = auth.uid()
  ));

CREATE POLICY "Doctors can view patient condition logs"
  ON public.condition_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') AND user_id IN (
    SELECT a.user_id FROM public.appointments a JOIN public.doctors d ON d.id = a.doctor_id WHERE d.user_id = auth.uid()
  ));

CREATE POLICY "Doctors can view their appointments"
  ON public.appointments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') AND doctor_id IN (
    SELECT id FROM public.doctors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Doctors can update their appointments"
  ON public.appointments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'doctor') AND doctor_id IN (
    SELECT id FROM public.doctors WHERE user_id = auth.uid()
  ));

-- ============================================
-- 20. ADMIN ACCESS POLICIES
-- ============================================

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all appointments"
  ON public.appointments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all prescriptions"
  ON public.prescriptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all condition logs"
  ON public.condition_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all vitals"
  ON public.vitals FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all medical reports"
  ON public.medical_reports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all medical history"
  ON public.medical_history FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all medications"
  ON public.medications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 21. STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-reports', 'medical-reports', false);
INSERT INTO storage.buckets (id, name, public, file_size_limit) VALUES ('chat-attachments', 'chat-attachments', true, 10485760);
INSERT INTO storage.buckets (id, name, public) VALUES ('doctor-documents', 'doctor-documents', false);

-- Profile photos storage policies
CREATE POLICY "Users can upload own profile photo"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own profile photo"
  ON storage.objects FOR UPDATE USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own profile photo"
  ON storage.objects FOR DELETE USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Profile photos are publicly viewable"
  ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos');

-- Medical reports storage policies
CREATE POLICY "Users can upload their own reports"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'medical-reports' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own report files"
  ON storage.objects FOR SELECT USING (bucket_id = 'medical-reports' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own report files"
  ON storage.objects FOR DELETE USING (bucket_id = 'medical-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Chat attachments storage policies
CREATE POLICY "Authenticated users can upload chat attachments"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat-attachments' AND auth.role() = 'authenticated');
CREATE POLICY "Anyone can view chat attachments"
  ON storage.objects FOR SELECT USING (bucket_id = 'chat-attachments');
CREATE POLICY "Users can delete own chat attachments"
  ON storage.objects FOR DELETE USING (bucket_id = 'chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Doctor documents storage policies
CREATE POLICY "Users can upload own doctor docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'doctor-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can view doctor docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'doctor-documents' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own doctor docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'doctor-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- 22. REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_logs;

-- ============================================
-- 23. SEED DATA - Demo Doctors
-- ============================================

INSERT INTO public.doctors (full_name, specialization, qualification, experience_years, rating, consultation_fee, hospital, bio, languages) VALUES
  ('Dr. Priya Sharma', 'General Physician', 'MBBS, MD', 12, 4.8, 500, 'Apollo Hospital', 'Experienced general physician specializing in preventive medicine and chronic disease management.', '{"English", "Hindi"}'),
  ('Dr. Rajesh Kumar', 'Cardiologist', 'MBBS, DM Cardiology', 18, 4.9, 1200, 'Fortis Heart Institute', 'Leading cardiologist with expertise in interventional cardiology and heart failure management.', '{"English", "Hindi", "Tamil"}'),
  ('Dr. Ananya Patel', 'Dermatologist', 'MBBS, MD Dermatology', 8, 4.6, 800, 'Skin & Care Clinic', 'Specialist in acne, eczema, psoriasis, and cosmetic dermatology procedures.', '{"English", "Hindi", "Gujarati"}'),
  ('Dr. Vikram Singh', 'Orthopedic Surgeon', 'MBBS, MS Ortho', 15, 4.7, 1000, 'Max Super Speciality', 'Expert in joint replacement, sports injuries, and minimally invasive spine surgery.', '{"English", "Hindi", "Punjabi"}'),
  ('Dr. Meera Iyer', 'Pediatrician', 'MBBS, MD Pediatrics', 10, 4.8, 600, 'Rainbow Children Hospital', 'Dedicated pediatrician focused on child development, vaccination, and pediatric emergencies.', '{"English", "Hindi", "Kannada"}'),
  ('Dr. Arjun Reddy', 'ENT Specialist', 'MBBS, MS ENT', 9, 4.5, 700, 'Care Hospital', 'Specialized in ear, nose, and throat disorders including sinus surgery and hearing issues.', '{"English", "Hindi", "Telugu"}'),
  ('Dr. Sneha Gupta', 'Gynecologist', 'MBBS, MS OBG', 14, 4.9, 900, 'Cloudnine Hospital', 'Expert in high-risk pregnancy, laparoscopic surgery, and fertility treatments.', '{"English", "Hindi"}'),
  ('Dr. Karan Malhotra', 'Neurologist', 'MBBS, DM Neurology', 11, 4.7, 1100, 'AIIMS', 'Specialist in epilepsy, stroke, headache disorders, and neurodegenerative diseases.', '{"English", "Hindi"}');

-- Seed availability for all doctors (Mon-Sat morning & evening slots)
INSERT INTO public.doctor_availability (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes)
SELECT d.id, dow.d, slot.s, slot.e, 30
FROM public.doctors d
CROSS JOIN (VALUES (1),(2),(3),(4),(5),(6)) AS dow(d)
CROSS JOIN (VALUES ('09:00'::time, '13:00'::time), ('16:00'::time, '20:00'::time)) AS slot(s, e);

-- ================================================================
-- DONE! Your E2Care database is ready.
-- 
-- NEXT STEPS:
-- 1. Update your .env file with the new Supabase URL and anon key
-- 2. Create an admin user manually:
--    INSERT INTO public.user_roles (user_id, role) VALUES ('<your-user-id>', 'admin');
-- ================================================================
