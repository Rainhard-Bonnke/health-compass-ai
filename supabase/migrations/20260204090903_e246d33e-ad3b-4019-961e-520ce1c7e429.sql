-- Fix security: Deny anonymous access to all sensitive tables
-- These policies ensure unauthenticated users cannot read any protected data

-- Profiles table: deny anonymous SELECT
CREATE POLICY "deny_anon_profiles" ON public.profiles
FOR SELECT TO anon USING (false);

-- Patient profiles: deny anonymous SELECT
CREATE POLICY "deny_anon_patient_profiles" ON public.patient_profiles
FOR SELECT TO anon USING (false);

-- Consultations: deny anonymous SELECT
CREATE POLICY "deny_anon_consultations" ON public.consultations
FOR SELECT TO anon USING (false);

-- Consultation messages: deny anonymous SELECT
CREATE POLICY "deny_anon_consultation_messages" ON public.consultation_messages
FOR SELECT TO anon USING (false);

-- Messages: deny anonymous SELECT
CREATE POLICY "deny_anon_messages" ON public.messages
FOR SELECT TO anon USING (false);

-- API keys: deny anonymous SELECT (critical security)
CREATE POLICY "deny_anon_api_keys" ON public.api_keys
FOR SELECT TO anon USING (false);

-- User roles: deny anonymous SELECT
CREATE POLICY "deny_anon_user_roles" ON public.user_roles
FOR SELECT TO anon USING (false);

-- Audit logs: deny anonymous SELECT
CREATE POLICY "deny_anon_audit_logs" ON public.audit_logs
FOR SELECT TO anon USING (false);