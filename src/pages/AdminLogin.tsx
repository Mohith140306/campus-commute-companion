import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if logged-in user is admin and redirect
  useEffect(() => {
    if (!loading && user) {
      checkAdminRole(user.id);
    }
  }, [user, loading]);

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: 'admin',
    });
    if (data) {
      navigate('/admin/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message,
        });
        setIsLoading(false);
        return;
      }

      // Check admin role
      const { data: isAdmin } = await supabase.rpc('has_role', {
        _user_id: data.user!.id,
        _role: 'admin',
      });

      if (!isAdmin) {
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You do not have admin privileges.",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Welcome, Admin!",
        description: "Redirecting to dashboard...",
      });
      navigate('/admin/dashboard');
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="card-elevated p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
          <p className="text-muted-foreground mt-2">
            Authorized administrators only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <Button
          variant="ghost"
          className="w-full mt-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
