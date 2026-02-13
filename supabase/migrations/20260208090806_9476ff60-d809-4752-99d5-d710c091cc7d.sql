
-- Doctors table
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Doctor availability slots
CREATE TABLE public.doctor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Appointments table
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

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Doctors: publicly readable
CREATE POLICY "Anyone can view doctors"
  ON public.doctors FOR SELECT
  USING (true);

-- Doctor availability: publicly readable
CREATE POLICY "Anyone can view availability"
  ON public.doctor_availability FOR SELECT
  USING (true);

-- Appointments: user can CRUD own appointments
CREATE POLICY "Users can view own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments"
  ON public.appointments FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at triggers
CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed some demo doctors
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
