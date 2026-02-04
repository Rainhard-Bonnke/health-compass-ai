-- Add explicit anonymous denial policies for all tables
-- Even though RLS without matching policies denies access, explicit denial is more secure
-- and makes the security intent clear

-- Note: Creating SELECT policies for anon role that always return false
-- This ensures anonymous users cannot access any data regardless of other policies

CREATE POLICY "Block anonymous profiles access" ON public.profiles
FOR SELECT TO anon USING (false);

CREATE POLICY "Block anonymous patient_profiles access" ON public.patient_profiles
FOR SELECT TO anon USING (false);

CREATE POLICY "Block anonymous consultations access" ON public.consultations
FOR SELECT TO anon USING (false);

CREATE POLICY "Block anonymous consultation_messages access" ON public.consultation_messages
FOR SELECT TO anon USING (false);

CREATE POLICY "Block anonymous messages access" ON public.messages
FOR SELECT TO anon USING (false);

CREATE POLICY "Block anonymous api_keys access" ON public.api_keys
FOR SELECT TO anon USING (false);

CREATE POLICY "Block anonymous user_roles access" ON public.user_roles
FOR SELECT TO anon USING (false);

CREATE POLICY "Block anonymous audit_logs access" ON public.audit_logs
FOR SELECT TO anon USING (false);

-- Also block INSERT/UPDATE/DELETE for anon role on all tables
CREATE POLICY "Block anonymous profiles insert" ON public.profiles FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Block anonymous profiles update" ON public.profiles FOR UPDATE TO anon USING (false);
CREATE POLICY "Block anonymous profiles delete" ON public.profiles FOR DELETE TO anon USING (false);

CREATE POLICY "Block anonymous patient_profiles insert" ON public.patient_profiles FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Block anonymous patient_profiles update" ON public.patient_profiles FOR UPDATE TO anon USING (false);
CREATE POLICY "Block anonymous patient_profiles delete" ON public.patient_profiles FOR DELETE TO anon USING (false);

CREATE POLICY "Block anonymous consultations insert" ON public.consultations FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Block anonymous consultations update" ON public.consultations FOR UPDATE TO anon USING (false);
CREATE POLICY "Block anonymous consultations delete" ON public.consultations FOR DELETE TO anon USING (false);

CREATE POLICY "Block anonymous consultation_messages insert" ON public.consultation_messages FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Block anonymous consultation_messages update" ON public.consultation_messages FOR UPDATE TO anon USING (false);
CREATE POLICY "Block anonymous consultation_messages delete" ON public.consultation_messages FOR DELETE TO anon USING (false);

CREATE POLICY "Block anonymous messages insert" ON public.messages FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Block anonymous messages update" ON public.messages FOR UPDATE TO anon USING (false);
CREATE POLICY "Block anonymous messages delete" ON public.messages FOR DELETE TO anon USING (false);

CREATE POLICY "Block anonymous api_keys insert" ON public.api_keys FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Block anonymous api_keys update" ON public.api_keys FOR UPDATE TO anon USING (false);
CREATE POLICY "Block anonymous api_keys delete" ON public.api_keys FOR DELETE TO anon USING (false);

CREATE POLICY "Block anonymous user_roles insert" ON public.user_roles FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Block anonymous user_roles update" ON public.user_roles FOR UPDATE TO anon USING (false);
CREATE POLICY "Block anonymous user_roles delete" ON public.user_roles FOR DELETE TO anon USING (false);

CREATE POLICY "Block anonymous audit_logs update" ON public.audit_logs FOR UPDATE TO anon USING (false);
CREATE POLICY "Block anonymous audit_logs delete" ON public.audit_logs FOR DELETE TO anon USING (false);

-- Fix message sending policy - restrict to users with existing consultation relationship
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "Users can send messages with relationship" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = sender_id AND
    (
        -- Users can only message people they have a consultation relationship with
        EXISTS (
            SELECT 1 FROM consultations
            WHERE (patient_id = sender_id AND assigned_provider_id = recipient_id)
               OR (assigned_provider_id = sender_id AND patient_id = recipient_id)
        )
        -- Or admins can message anyone
        OR has_role(auth.uid(), 'admin'::app_role)
    )
);