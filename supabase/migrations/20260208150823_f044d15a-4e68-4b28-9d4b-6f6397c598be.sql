
-- Add license/certificate fields to doctors table
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS license_number text,
ADD COLUMN IF NOT EXISTS license_url text,
ADD COLUMN IF NOT EXISTS certificate_url text;

-- Create doctor-documents storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('doctor-documents', 'doctor-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own doctor documents
CREATE POLICY "Users can upload own doctor docs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'doctor-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow admins to view all doctor documents
CREATE POLICY "Admins can view doctor docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'doctor-documents' AND public.has_role(auth.uid(), 'admin'));

-- Allow users to view their own doctor documents
CREATE POLICY "Users can view own doctor docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'doctor-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
