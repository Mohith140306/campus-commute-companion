import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function DriverLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/driver/dashboard');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Welcome!",
          description: "Successfully logged in.",
        });
        navigate('/driver/dashboard');
      }
    } catch (err) {
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
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Driver Login</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to update your bus location
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="driver@college.edu"
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
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-secondary rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Contact the transport office if you need login credentials.
          </p>
        </div>

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
