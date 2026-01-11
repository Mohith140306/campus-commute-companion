import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="card-elevated p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
          <Shield className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Admin Login</h1>
        <p className="text-muted-foreground mb-6">
          This section is for authorized administrators only. Please contact the IT department for access.
        </p>
        <div className="p-4 bg-secondary rounded-lg mb-6">
          <p className="text-sm text-muted-foreground">
            Admin dashboard coming soon. This will allow administrators to manage buses, drivers, and view reports.
          </p>
        </div>
        <Link to="/">
          <Button variant="outline" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
