-- Allow admins to update any bus
CREATE POLICY "Admins can update any bus"
ON public.buses
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
