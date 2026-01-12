import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Bus, 
  LogOut, 
  Loader2, 
  Navigation,
  AlertTriangle,
  CheckCircle,
  Wrench,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDriverProfile, useUpdateBusLocation } from '@/hooks/useDriverProfile';
import { useToast } from '@/hooks/use-toast';
import { BusMap } from '@/components/BusMap';

type BusStatus = 'active' | 'delayed' | 'maintenance';

const statusConfig: Record<BusStatus, { label: string; icon: React.ElementType; className: string }> = {
  active: { label: 'On Route', icon: CheckCircle, className: 'bg-green-500' },
  delayed: { label: 'Delayed', icon: AlertTriangle, className: 'bg-orange-500' },
  maintenance: { label: 'Maintenance', icon: Wrench, className: 'bg-gray-500' },
};

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: driverProfile, isLoading: profileLoading, refetch } = useDriverProfile(user?.id);
  const { updateLocation, updateStatus } = useUpdateBusLocation();
  const { toast } = useToast();
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/driver/login');
    }
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/driver/login');
  };

  const handleUpdateLocation = async () => {
    if (!driverProfile?.bus_id) {
      toast({
        variant: "destructive",
        title: "No Bus Assigned",
        description: "You are not assigned to any bus.",
      });
      return;
    }

    setIsUpdatingLocation(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      await updateLocation(
        driverProfile.bus_id,
        position.coords.latitude,
        position.coords.longitude
      );

      toast({
        title: "Location Updated",
        description: "Bus location has been updated successfully.",
      });
      
      refetch();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err instanceof GeolocationPositionError 
          ? "Could not get your location. Please enable GPS."
          : "Failed to update bus location.",
      });
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleStatusChange = async (newStatus: BusStatus) => {
    if (!driverProfile?.bus_id) return;
    
    setIsUpdatingStatus(true);
    try {
      await updateStatus(driverProfile.bus_id, newStatus);
      toast({
        title: "Status Updated",
        description: `Bus status changed to ${statusConfig[newStatus].label}.`,
      });
      refetch();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update bus status.",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!driverProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Driver Profile</h2>
            <p className="text-muted-foreground mb-4">
              Your account is not set up as a driver. Contact the transport office.
            </p>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStatus = (driverProfile.bus?.status || 'active') as BusStatus;
  const StatusIcon = statusConfig[currentStatus].icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <Bus className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Driver Dashboard</h1>
              <p className="text-sm text-muted-foreground">{driverProfile.full_name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Bus Info Card */}
        {driverProfile.bus ? (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">My Bus</CardTitle>
                <Badge className={statusConfig[currentStatus].className}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig[currentStatus].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bus Number</p>
                  <p className="font-semibold text-lg">{driverProfile.bus.bus_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Route</p>
                  <p className="font-medium">{driverProfile.bus.route_name}</p>
                </div>
              </div>

              {/* Map Preview */}
              <div className="h-48 rounded-lg overflow-hidden border border-border">
                <BusMap 
                  bus={{
                    id: driverProfile.bus.id,
                    bus_number: driverProfile.bus.bus_number,
                    route_name: driverProfile.bus.route_name,
                    driver_name: driverProfile.full_name,
                    status: currentStatus,
                    current_lat: driverProfile.bus.current_lat,
                    current_lng: driverProfile.bus.current_lng,
                    eta: null,
                    speed: null,
                    last_updated: null,
                    created_at: '',
                  }}
                  className="h-full"
                />
              </div>

              {driverProfile.bus.current_lat && driverProfile.bus.current_lng && (
                <p className="text-xs text-muted-foreground text-center">
                  Last known: {driverProfile.bus.current_lat.toFixed(4)}, {driverProfile.bus.current_lng.toFixed(4)}
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <Bus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No bus assigned to you yet.</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {driverProfile.bus && (
          <>
            {/* Update Location */}
            <Button 
              className="w-full h-14 text-lg"
              onClick={handleUpdateLocation}
              disabled={isUpdatingLocation}
            >
              {isUpdatingLocation ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Updating Location...
                </>
              ) : (
                <>
                  <Navigation className="w-5 h-5 mr-2" />
                  Update My Location
                </>
              )}
            </Button>

            {/* Status Buttons */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Update Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(statusConfig) as [BusStatus, typeof statusConfig[BusStatus]][]).map(
                    ([status, config]) => {
                      const Icon = config.icon;
                      return (
                        <Button
                          key={status}
                          variant={currentStatus === status ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStatusChange(status)}
                          disabled={isUpdatingStatus || currentStatus === status}
                          className="flex-col h-auto py-3"
                        >
                          <Icon className="w-4 h-4 mb-1" />
                          <span className="text-xs">{config.label}</span>
                        </Button>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Refresh */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => refetch()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </>
        )}
      </main>
    </div>
  );
}
