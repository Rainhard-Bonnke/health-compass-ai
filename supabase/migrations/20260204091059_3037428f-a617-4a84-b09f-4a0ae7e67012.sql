-- Fix RLS: Drop restrictive deny policies and recreate them as PERMISSIVE with (false) for anon
-- In Postgres, restrictive policies only restrict already-granted access, so they don't block anon when permissive policies exist for authenticated users
-- The solution is to ensure all SELECT policies explicitly require authenticated role

-- First, drop all the ineffective restrictive deny policies
DROP POLICY IF EXISTS "deny_anon_profiles" ON public.profiles;
DROP POLICY IF EXISTS "deny_anon_patient_profiles" ON public.patient_profiles;
DROP POLICY IF EXISTS "deny_anon_consultations" ON public.consultations;
DROP POLICY IF EXISTS "deny_anon_consultation_messages" ON public.consultation_messages;
DROP POLICY IF EXISTS "deny_anon_messages" ON public.messages;
DROP POLICY IF EXISTS "deny_anon_api_keys" ON public.api_keys;
DROP POLICY IF EXISTS "deny_anon_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "deny_anon_audit_logs" ON public.audit_logs;

-- Profiles: Update existing policies to explicitly target authenticated role
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Providers can view patient profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Providers can view patient profiles" ON public.profiles
FOR SELECT TO authenticated USING (
    has_role(auth.uid(), 'provider'::app_role) OR has_role(auth.uid(), 'admin'::app_role)
);

-- Patient profiles: Update policies to target authenticated role
DROP POLICY IF EXISTS "Patients can view own medical profile" ON public.patient_profiles;
DROP POLICY IF EXISTS "Providers can view assigned patient profiles" ON public.patient_profiles;
DROP POLICY IF EXISTS "Admins can view all patient profiles" ON public.patient_profiles;

CREATE POLICY "Patients can view own medical profile" ON public.patient_profiles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Providers can view assigned patient profiles" ON public.patient_profiles
FOR SELECT TO authenticated USING (
    has_role(auth.uid(), 'provider'::app_role) AND EXISTS (
        SELECT 1 FROM consultations
        WHERE consultations.patient_id = patient_profiles.user_id
        AND consultations.assigned_provider_id = auth.uid()
    )
);

CREATE POLICY "Admins can view all patient profiles" ON public.patient_profiles
FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Consultations: Update policies to target authenticated role
DROP POLICY IF EXISTS "Patients can view own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Providers can view assigned consultations" ON public.consultations;
DROP POLICY IF EXISTS "Admins can manage all consultations" ON public.consultations;

CREATE POLICY "Patients can view own consultations" ON public.consultations
FOR SELECT TO authenticated USING (auth.uid() = patient_id);

CREATE POLICY "Providers can view assigned consultations" ON public.consultations
FOR SELECT TO authenticated USING (
    has_role(auth.uid(), 'provider'::app_role) AND assigned_provider_id = auth.uid()
);

CREATE POLICY "Admins can manage all consultations" ON public.consultations
FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Consultation messages: Update policies  
DROP POLICY IF EXISTS "Users can view messages of their consultations" ON public.consultation_messages;

CREATE POLICY "Users can view messages of their consultations" ON public.consultation_messages
FOR SELECT TO authenticated USING (
    EXISTS (
        SELECT 1 FROM consultations
        WHERE consultations.id = consultation_messages.consultation_id
        AND (consultations.patient_id = auth.uid() OR consultations.assigned_provider_id = auth.uid())
    )
);

-- Messages: Update policies to target authenticated role
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;

CREATE POLICY "Users can view own messages" ON public.messages
FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- User roles: Update policies
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Audit logs: Update policies
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert own audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can insert own audit logs" ON public.audit_logs
FOR INSERT TO authenticated WITH CHECK (
    auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)
);

-- API keys: Update policies
DROP POLICY IF EXISTS "Admins can manage api keys" ON public.api_keys;

CREATE POLICY "Admins can manage api keys" ON public.api_keys
FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));