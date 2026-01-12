-- Create buses table
CREATE TABLE public.buses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bus_number TEXT NOT NULL UNIQUE,
  route_name TEXT NOT NULL,
  driver_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'delayed', 'maintenance')),
  current_lat DECIMAL(10, 8),
  current_lng DECIMAL(11, 8),
  eta TEXT,
  speed INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emergency_reports table
CREATE TABLE public.emergency_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  emergency_type TEXT NOT NULL CHECK (emergency_type IN ('breakdown', 'accident', 'medical', 'safety')),
  message TEXT,
  reference_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('bus', 'driver', 'app', 'safety')),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Buses: Anyone can read (public tracking)
CREATE POLICY "Anyone can view buses" ON public.buses FOR SELECT USING (true);

-- Emergency reports: Anyone can create, only admins can update (for now allow all reads for demo)
CREATE POLICY "Anyone can create emergency reports" ON public.emergency_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view emergency reports" ON public.emergency_reports FOR SELECT USING (true);

-- Feedback: Anyone can submit, anyone can read (for demo)
CREATE POLICY "Anyone can submit feedback" ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view feedback" ON public.feedback FOR SELECT USING (true);

-- Insert initial bus data
INSERT INTO public.buses (bus_number, route_name, driver_name, status, current_lat, current_lng, eta, speed) VALUES
  ('KA-01-1234', 'Campus Express', 'Ramesh Kumar', 'active', 12.9716, 77.5946, '5 mins', 35),
  ('KA-01-5678', 'City Connect', 'Suresh Babu', 'active', 12.9606, 77.6087, '12 mins', 28),
  ('KA-01-9012', 'Metro Link', 'Venkatesh R', 'delayed', 12.9352, 77.6245, '25 mins', 15),
  ('KA-01-3456', 'Green Line', 'Manjunath S', 'active', 12.9856, 77.5643, '8 mins', 42),
  ('KA-01-7890', 'Blue Route', 'Prasad M', 'maintenance', NULL, NULL, 'N/A', 0);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for emergency_reports
CREATE TRIGGER update_emergency_reports_updated_at
BEFORE UPDATE ON public.emergency_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();