-- Create driver role enum
CREATE TYPE public.app_role AS ENUM ('driver', 'admin');

-- Create user_roles table for driver authentication
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create drivers table to map drivers to buses
CREATE TABLE public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    bus_id UUID REFERENCES public.buses(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on drivers table
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get driver's assigned bus_id
CREATE OR REPLACE FUNCTION public.get_driver_bus_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT bus_id
  FROM public.drivers
  WHERE user_id = _user_id
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for drivers table
CREATE POLICY "Drivers can view their own profile"
ON public.drivers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Drivers can update their own profile"
ON public.drivers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Update buses RLS: Allow drivers to update ONLY their assigned bus
CREATE POLICY "Drivers can update their assigned bus"
ON public.buses
FOR UPDATE
TO authenticated
USING (id = public.get_driver_bus_id(auth.uid()))
WITH CHECK (id = public.get_driver_bus_id(auth.uid()));

-- Trigger to update updated_at for drivers table
CREATE TRIGGER update_drivers_updated_at
BEFORE UPDATE ON public.drivers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();