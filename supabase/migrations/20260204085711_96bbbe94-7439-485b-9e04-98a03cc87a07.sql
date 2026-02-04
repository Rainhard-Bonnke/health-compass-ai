-- Fix the overly permissive RLS policy on audit_logs
-- Drop the old policy
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Create a more secure policy - only authenticated users can create audit logs for their own actions
CREATE POLICY "Authenticated users can insert own audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL));