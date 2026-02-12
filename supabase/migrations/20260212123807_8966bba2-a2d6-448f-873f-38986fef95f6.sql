
-- Allow admins to INSERT buses
CREATE POLICY "Admins can insert buses"
ON public.buses
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to INSERT drivers
CREATE POLICY "Admins can insert drivers"
ON public.drivers
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to INSERT user_roles
CREATE POLICY "Admins can insert user_roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all drivers
CREATE POLICY "Admins can view all drivers"
ON public.drivers
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
