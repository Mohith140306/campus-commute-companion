import { Search, MapPin, Star, AlertTriangle, MessageSquare } from 'lucide-react';
import { FeatureCard } from '@/components/FeatureCard';
import { AppHeader } from '@/components/AppHeader';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      {/* Welcome Section */}
      <div className="bg-background px-6 py-6">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground">
            Welcome, Student! <span className="inline-block animate-wave">👋</span>
          </h2>
          <p className="text-muted-foreground mt-1">Track your college bus in real-time</p>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <main className="px-6 pb-8">
        <div className="container max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              title="Track Bus by Number"
              description="Enter bus number to see live location and ETA"
              icon={Search}
              iconBgClass="bg-blue-100"
              iconColorClass="text-blue-600"
              to="/track"
            />

            <FeatureCard
              title="Nearby Buses"
              description="Find buses close to your current location"
              icon={MapPin}
              iconBgClass="bg-green-100"
              iconColorClass="text-green-600"
              to="/nearby"
            />

            <FeatureCard
              title="My Favourites"
              description="Quick access to your saved bus routes"
              icon={Star}
              iconBgClass="bg-amber-100"
              iconColorClass="text-amber-600"
              to="/favourites"
            />

            <FeatureCard
              title="Emergency"
              description="Report emergencies and get immediate help"
              icon={AlertTriangle}
              iconBgClass="bg-red-100"
              iconColorClass="text-red-500"
              to="/emergency"
            />

            <FeatureCard
              title="Feedback"
              description="Share your suggestions and report issues"
              icon={MessageSquare}
              iconBgClass="bg-blue-100"
              iconColorClass="text-blue-600"
              to="/feedback"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
