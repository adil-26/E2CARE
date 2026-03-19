-- Ayurvedic Acupressure Case History Schema

-- 1. ayurvedic_cases (Tracks the overall case for a patient and doctor)
CREATE TABLE public.ayurvedic_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    title TEXT,
    description TEXT
);
ALTER TABLE public.ayurvedic_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view their own cases" ON public.ayurvedic_cases FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctors manage their cases" ON public.ayurvedic_cases FOR ALL USING (
    EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = doctor_id AND d.user_id = auth.uid())
);

-- 2. ayurvedic_visits (Tracks each session/follow-up)
CREATE TABLE public.ayurvedic_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.ayurvedic_cases(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    vitals JSONB, -- { sleep: "11:30 pm to 5:00 am", thirst: "Normal", urine: "8-9 D, 1 N", appetite: "Excess", ... }
    investigations JSONB, -- { blood_tests: [{ name: "Hb", value: 11.8, trend: "low" }], usg: "Enlarged liver...", mri: "Loss of cervical curvature..." }
    treatment_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.ayurvedic_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view their own visits" ON public.ayurvedic_visits FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.ayurvedic_cases c WHERE c.id = case_id AND c.patient_id = auth.uid())
);
CREATE POLICY "Doctors manage their visits" ON public.ayurvedic_visits FOR ALL USING (
    EXISTS (SELECT 1 FROM public.ayurvedic_cases c JOIN public.doctors d ON c.doctor_id = d.id WHERE c.id = case_id AND d.user_id = auth.uid())
);

-- 3. ayurvedic_symptoms (Tracks the progressive relief % per symptom)
CREATE TABLE public.ayurvedic_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.ayurvedic_cases(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES public.ayurvedic_visits(id) ON DELETE CASCADE,
    symptom_name TEXT NOT NULL,
    duration TEXT, -- e.g., "3 months", "20 days"
    relief_percentage INTEGER DEFAULT 0 CHECK (relief_percentage >= 0 AND relief_percentage <= 100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.ayurvedic_symptoms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view their symptom progress" ON public.ayurvedic_symptoms FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.ayurvedic_cases c WHERE c.id = case_id AND c.patient_id = auth.uid())
);
CREATE POLICY "Doctors manage symptoms" ON public.ayurvedic_symptoms FOR ALL USING (
    EXISTS (SELECT 1 FROM public.ayurvedic_cases c JOIN public.doctors d ON c.doctor_id = d.id WHERE c.id = case_id AND d.user_id = auth.uid())
);

-- 4. ayurvedic_formulas (Stores the interactive joint/element logic)
CREATE TABLE public.ayurvedic_formulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID NOT NULL REFERENCES public.ayurvedic_visits(id) ON DELETE CASCADE,
    body_part TEXT NOT NULL, -- e.g., "Toe No. 0"
    joint TEXT, -- e.g., "V jt.", "P jt."
    elements JSONB, -- { tonify: [1, 7], sedate: [2, 5] }
    color_applied TEXT, -- e.g., "Black colour"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.ayurvedic_formulas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view their formulas" ON public.ayurvedic_formulas FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.ayurvedic_visits v JOIN public.ayurvedic_cases c ON v.case_id = c.id WHERE v.id = visit_id AND c.patient_id = auth.uid())
);
CREATE POLICY "Doctors manage formulas" ON public.ayurvedic_formulas FOR ALL USING (
    EXISTS (SELECT 1 FROM public.ayurvedic_visits v JOIN public.ayurvedic_cases c ON v.case_id = c.id JOIN public.doctors d ON c.doctor_id = d.id WHERE v.id = visit_id AND d.user_id = auth.uid())
);

-- 5. ayurvedic_diagrams (Stores diagram markers and uploaded images)
CREATE TABLE public.ayurvedic_diagrams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID NOT NULL REFERENCES public.ayurvedic_visits(id) ON DELETE CASCADE,
    diagram_type TEXT NOT NULL CHECK (diagram_type IN ('hand', 'foot', 'body', 'custom')),
    image_url TEXT, -- If they uploaded a specific photo to draw on
    markers JSONB, -- Array of objects { x, y, color, label } indicating where points are applied
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.ayurvedic_diagrams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients view their diagrams" ON public.ayurvedic_diagrams FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.ayurvedic_visits v JOIN public.ayurvedic_cases c ON v.case_id = c.id WHERE v.id = visit_id AND c.patient_id = auth.uid())
);
CREATE POLICY "Doctors manage diagrams" ON public.ayurvedic_diagrams FOR ALL USING (
    EXISTS (SELECT 1 FROM public.ayurvedic_visits v JOIN public.ayurvedic_cases c ON v.case_id = c.id JOIN public.doctors d ON c.doctor_id = d.id WHERE v.id = visit_id AND d.user_id = auth.uid())
);
