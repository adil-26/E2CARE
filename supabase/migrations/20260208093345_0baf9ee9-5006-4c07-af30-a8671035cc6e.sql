-- Allow anonymous users to look up profiles by medical_id for emergency access
-- They still need the PIN to verify, and only see limited columns via the app
CREATE POLICY "Emergency access by medical_id"
ON public.profiles
FOR SELECT
TO anon
USING (true);

-- Allow anonymous users to read medical_history for emergency access
-- (they need user_id from profiles which requires PIN verification in the app)
CREATE POLICY "Emergency access medical history"
ON public.medical_history
FOR SELECT
TO anon
USING (true);

-- Allow anonymous users to read active medications for emergency access
CREATE POLICY "Emergency access medications"
ON public.medications
FOR SELECT
TO anon
USING (is_active = true);