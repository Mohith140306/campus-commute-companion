import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Bus, UserPlus, CheckCircle2 } from 'lucide-react';

interface CreatedCredentials {
  email: string;
  password: string;
  busNumber: string;
  routeName: string;
}

export default function AddBusDriverForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<CreatedCredentials | null>(null);

  const [busNumber, setBusNumber] = useState('');
  const [routeName, setRouteName] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [driverPassword, setDriverPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!busNumber.trim()) e.busNumber = 'Bus number is required';
    if (!routeName.trim()) e.routeName = 'Route name is required';
    if (!driverName.trim()) e.driverName = 'Driver name is required';
    if (!driverEmail.trim()) e.driverEmail = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(driverEmail)) e.driverEmail = 'Invalid email format';
    if (!driverPassword) e.driverPassword = 'Password is required';
    else if (driverPassword.length < 6) e.driverPassword = 'Password must be at least 6 characters';
    if (driverPassword !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(
        `https://ezqgjcauznmqhdzrjolr.supabase.co/functions/v1/create-bus-driver`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bus_number: busNumber.trim(),
            route_name: routeName.trim(),
            driver_name: driverName.trim(),
            driver_email: driverEmail.trim(),
            driver_password: driverPassword,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Something went wrong' });
        return;
      }

      setCreated({
        email: driverEmail.trim(),
        password: driverPassword,
        busNumber: busNumber.trim(),
        routeName: routeName.trim(),
      });

      toast({ title: 'Success', description: 'Bus and Driver account created successfully!' });

      // Reset form
      setBusNumber('');
      setRouteName('');
      setDriverName('');
      setDriverEmail('');
      setDriverPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {created && (
        <Card className="border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Bus & Driver Created!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Bus <strong>{created.busNumber}</strong> ({created.routeName}) is ready.
                </p>
                <div className="mt-2 p-3 rounded-md bg-background border text-sm font-mono space-y-1">
                  <p>Email: <strong>{created.email}</strong></p>
                  <p>Password: <strong>{created.password}</strong></p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  The driver can now log in at /driver with these credentials.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add New Bus & Driver
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="busNumber">Bus Number</Label>
                <div className="relative">
                  <Bus className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="busNumber"
                    placeholder="e.g. KA-01-1234"
                    className="pl-9"
                    value={busNumber}
                    onChange={(e) => setBusNumber(e.target.value)}
                  />
                </div>
                {errors.busNumber && <p className="text-xs text-destructive">{errors.busNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="routeName">Route Name</Label>
                <Input
                  id="routeName"
                  placeholder="e.g. Campus Express"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                />
                {errors.routeName && <p className="text-xs text-destructive">{errors.routeName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="driverName">Driver Name</Label>
              <Input
                id="driverName"
                placeholder="e.g. Raju Kumar"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
              />
              {errors.driverName && <p className="text-xs text-destructive">{errors.driverName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="driverEmail">Driver Email</Label>
              <Input
                id="driverEmail"
                type="email"
                placeholder="e.g. driver@college.edu"
                value={driverEmail}
                onChange={(e) => setDriverEmail(e.target.value)}
              />
              {errors.driverEmail && <p className="text-xs text-destructive">{errors.driverEmail}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driverPassword">Password</Label>
                <Input
                  id="driverPassword"
                  type="password"
                  placeholder="Min 6 characters"
                  value={driverPassword}
                  onChange={(e) => setDriverPassword(e.target.value)}
                />
                {errors.driverPassword && <p className="text-xs text-destructive">{errors.driverPassword}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating…
                </>
              ) : (
                'Create Bus & Driver'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
