-- Fix security: Providers should ONLY see consultations explicitly assigned to them
-- Remove the "assigned_provider_id IS NULL" condition which exposes unassigned consultations

DROP POLICY IF EXISTS "Providers can view assigned consultations" ON public.consultations;

CREATE POLICY "Providers can view assigned consultations" ON public.consultations
FOR SELECT TO authenticated
USING (
    has_role(auth.uid(), 'provider'::app_role) AND assigned_provider_id = auth.uid()
);