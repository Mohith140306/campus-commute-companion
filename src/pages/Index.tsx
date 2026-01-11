import { Bus, MapPin, Star, AlertTriangle, MessageSquare } from 'lucide-react';
import { FeatureCard } from '@/components/FeatureCard';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="gradient-hero text-primary-foreground px-4 pt-8 pb-12 safe-top relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-primary-foreground/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-primary-foreground/10 blur-3xl" />
        </div>
        
        <div className="container max-w-lg mx-auto relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center animate-fade-in">
              <Bus className="w-8 h-8" />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h1 className="text-2xl font-bold tracking-tight">College Bus Tracker</h1>
              <p className="text-primary-foreground/70 text-sm mt-0.5">
                Live bus tracking & alerts for students
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">8</div>
              <div className="text-xs text-primary-foreground/70">Active Buses</div>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">6</div>
              <div className="text-xs text-primary-foreground/70">On Route</div>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">12</div>
              <div className="text-xs text-primary-foreground/70">Routes</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 -mt-4 pb-8 safe-bottom">
        <div className="container max-w-lg mx-auto space-y-3">
          {/* Feature Cards */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <FeatureCard
              title="Track Bus by Number"
              description="Search and track any college bus in real-time"
              icon={Bus}
              iconBgClass="gradient-primary"
              to="/track"
            />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
            <FeatureCard
              title="Nearby Buses"
              description="Find buses closest to your current location"
              icon={MapPin}
              iconBgClass="gradient-success"
              to="/nearby"
            />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <FeatureCard
              title="My Favourites"
              description="Quick access to your saved bus routes"
              icon={Star}
              iconBgClass="bg-warning"
              to="/favourites"
            />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.45s' }}>
            <FeatureCard
              title="Emergency"
              description="Report emergencies and get immediate help"
              icon={AlertTriangle}
              iconBgClass="gradient-emergency"
              to="/emergency"
              badge="SOS"
              badgeClass="bg-emergency text-emergency-foreground"
            />
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <FeatureCard
              title="Feedback"
              description="Share your suggestions and report issues"
              icon={MessageSquare}
              iconBgClass="gradient-accent"
              to="/feedback"
            />
          </div>

          {/* Help Card */}
          <div className="mt-6 animate-fade-in" style={{ animationDelay: '0.55s' }}>
            <div className="card-elevated p-4 bg-secondary/50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Bus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Need Help?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Contact the transport office at <span className="font-medium text-primary">+91 80-1234-5678</span> for any queries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
