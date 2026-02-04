-- Explicitly deny anonymous SELECT access to all sensitive tables
-- This ensures unauthenticated users cannot read any data

-- profiles: block anonymous
CREATE POLICY "anon_profiles_deny" ON public.profiles
  FOR SELECT TO anon
  USING (false);

-- patient_profiles: block anonymous
CREATE POLICY "anon_patient_profiles_deny" ON public.patient_profiles
  FOR SELECT TO anon
  USING (false);

-- consultations: block anonymous
CREATE POLICY "anon_consultations_deny" ON public.consultations
  FOR SELECT TO anon
  USING (false);

-- consultation_messages: block anonymous
CREATE POLICY "anon_consultation_messages_deny" ON public.consultation_messages
  FOR SELECT TO anon
  USING (false);

-- messages: block anonymous
CREATE POLICY "anon_messages_deny" ON public.messages
  FOR SELECT TO anon
  USING (false);

-- api_keys: block anonymous
CREATE POLICY "anon_api_keys_deny" ON public.api_keys
  FOR SELECT TO anon
  USING (false);

-- user_roles: block anonymous
CREATE POLICY "anon_user_roles_deny" ON public.user_roles
  FOR SELECT TO anon
  USING (false);

-- audit_logs: block anonymous
CREATE POLICY "anon_audit_logs_deny" ON public.audit_logs
  FOR SELECT TO anon
  USING (false);