-- Add a policy to allow providers to see all consultations for queue management
CREATE POLICY "providers_view_all_consultations" ON public.consultations 
  FOR SELECT TO authenticated 
  USING (has_role(auth.uid(), 'provider'::app_role));

-- Add a policy for receptionists to manage appointments
CREATE POLICY "appointments_receptionist_manage" ON public.appointments 
  FOR ALL TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.staff_profiles WHERE user_id = auth.uid() AND staff_role = 'receptionist'));

-- Add insert policy for queue by receptionist
CREATE POLICY "queue_receptionist_insert" ON public.walk_in_queue 
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.staff_profiles WHERE user_id = auth.uid() AND staff_role = 'receptionist'));

-- Enable realtime for queue updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.walk_in_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;