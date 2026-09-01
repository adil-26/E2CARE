GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctor_availability TO authenticated;
GRANT ALL ON public.doctor_availability TO service_role;

CREATE POLICY "Doctors manage own availability"
ON public.doctor_availability
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = doctor_availability.doctor_id AND d.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = doctor_availability.doctor_id AND d.user_id = auth.uid()));

CREATE POLICY "Admins manage all availability"
ON public.doctor_availability
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));