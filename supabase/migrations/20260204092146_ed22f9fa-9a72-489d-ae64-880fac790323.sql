-- Drop the ineffective "Block anonymous" policies that use USING (false)
-- These don't actually block SELECT - they need to be replaced with proper policies

DROP POLICY IF EXISTS "Block anonymous profiles access" ON public.profiles;
DROP POLICY IF EXISTS "Block anonymous patient_profiles access" ON public.patient_profiles;
DROP POLICY IF EXISTS "Block anonymous consultations access" ON public.consultations;
DROP POLICY IF EXISTS "Block anonymous consultation_messages access" ON public.consultation_messages;
DROP POLICY IF EXISTS "Block anonymous messages access" ON public.messages;
DROP POLICY IF EXISTS "Block anonymous api_keys access" ON public.api_keys;
DROP POLICY IF EXISTS "Block anonymous user_roles access" ON public.user_roles;
DROP POLICY IF EXISTS "Block anonymous audit_logs access" ON public.audit_logs;

-- Drop existing authenticated SELECT policies to recreate them with explicit role targeting
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Patients can view their own patient_profiles" ON public.patient_profiles;
DROP POLICY IF EXISTS "Authenticated users can view own patient profile" ON public.patient_profiles;
DROP POLICY IF EXISTS "Patients can view own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Authenticated users can view own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Providers can view assigned consultations" ON public.consultations;
DROP POLICY IF EXISTS "Authenticated providers view assigned consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users can view own consultation messages" ON public.consultation_messages;
DROP POLICY IF EXISTS "Authenticated users view consultation messages" ON public.consultation_messages;
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users view own messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can view api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "Authenticated admins view api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated admins view audit_logs" ON public.audit_logs;

-- Recreate policies with proper role-based access (authenticated role only)

-- profiles: users can only see their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- patient_profiles: patients can only see their own
CREATE POLICY "patient_profiles_select_own" ON public.patient_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "patient_profiles_update_own" ON public.patient_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- consultations: patients see own, providers see assigned
CREATE POLICY "consultations_select_patient" ON public.consultations
  FOR SELECT TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "consultations_select_provider" ON public.consultations
  FOR SELECT TO authenticated
  USING (auth.uid() = assigned_provider_id);

CREATE POLICY "consultations_insert_patient" ON public.consultations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "consultations_update_provider" ON public.consultations
  FOR UPDATE TO authenticated
  USING (auth.uid() = assigned_provider_id)
  WITH CHECK (auth.uid() = assigned_provider_id);

-- consultation_messages: users can see messages for consultations they're part of
CREATE POLICY "consultation_messages_select" ON public.consultation_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.consultations c
      WHERE c.id = consultation_id
      AND (c.patient_id = auth.uid() OR c.assigned_provider_id = auth.uid())
    )
  );

CREATE POLICY "consultation_messages_insert" ON public.consultation_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.consultations c
      WHERE c.id = consultation_id
      AND (c.patient_id = auth.uid() OR c.assigned_provider_id = auth.uid())
    )
  );

-- messages: users can see messages where they are sender or recipient
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_update_read" ON public.messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- api_keys: only admins can access
CREATE POLICY "api_keys_select_admin" ON public.api_keys
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "api_keys_insert_admin" ON public.api_keys
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "api_keys_update_admin" ON public.api_keys
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "api_keys_delete_admin" ON public.api_keys
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- user_roles: users see own role, admins see all
CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- audit_logs: only admins
CREATE POLICY "audit_logs_select_admin" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "audit_logs_insert_authenticated" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);