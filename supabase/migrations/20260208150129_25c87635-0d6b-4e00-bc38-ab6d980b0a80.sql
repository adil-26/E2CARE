
-- Add status column to doctors table for approval workflow
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved';

-- Update existing doctors to approved
UPDATE public.doctors SET status = 'approved' WHERE status IS NULL OR status = 'approved';

-- Allow authenticated users to insert their own doctor application
CREATE POLICY "Users can register as doctor" 
ON public.doctors 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Allow users to view their own doctor profile
CREATE POLICY "Users can view own doctor profile" 
ON public.doctors 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Allow admins to update doctor status (approve/reject)
-- (Admins already have ALL policy via "Admins can manage all doctors")

-- Allow doctors to update their own profile details (not status)
CREATE POLICY "Doctors can update own profile" 
ON public.doctors 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid() AND status = 'approved');
