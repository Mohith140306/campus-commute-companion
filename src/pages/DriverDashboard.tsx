import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bus, 
  LogOut, 
  Loader2, 
  Navigation,
  Play,
  Square,
  MapPin,
  Route,
  Clock,
  Gauge
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDriverProfile, useUpdateBusLocation } from '@/hooks/useDriverProfile';
import { useGpsTracking } from '@/hooks/useGpsTracking';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useToast } from '@/hooks/use-toast';
import { BusMap } from '@/components/BusMap';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: driverProfile, isLoading: profileLoading, refetch } = useDriverProfile(user?.id);
  const { updateStatus } = useUpdateBusLocation();
  const { toast } = useToast();
  
  const [isTripActive, setIsTripActive] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Real GPS tracking - auto-starts when trip is active
  const gpsTracking = useGpsTracking({
    busId: driverProfile?.bus_id ?? null,
    enabled: isTripActive,
  });

  // Keep screen awake during active trips
  useWakeLock(isTripActive);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/driver');
    }
  }, [user, authLoading, navigate]);

  // Sync trip status with bus status
  useEffect(() => {
    if (driverProfile?.bus?.status === 'active') {
      setIsTripActive(true);
    } else {
      setIsTripActive(false);
    }
  }, [driverProfile?.bus?.status]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleTripToggle = async () => {
    if (!driverProfile?.bus_id) return;
    
    setIsUpdating(true);
    try {
      const newStatus = isTripActive ? 'maintenance' : 'active';
      await updateStatus(driverProfile.bus_id, newStatus);
      setIsTripActive(!isTripActive);
      
      if (isTripActive) {
        // GPS stops automatically since enabled is tied to isTripActive
      }
      toast({
        title: isTripActive ? "Trip Ended" : "Trip Started",
        description: isTripActive 
          ? "Your trip has been ended. Safe travels!" 
          : "Your trip is now active. Drive safely!",
      });
      refetch();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update trip status.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // GPS status is now automatic - no separate toggle needed

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!driverProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <Bus className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-center">No Driver Profile</h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Your account is not set up as a driver. Contact the transport office.
        </p>
        <Button onClick={handleLogout} variant="outline" className="mt-4">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Bus className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">Driver Panel</h1>
              <p className="text-sm text-muted-foreground">{driverProfile.full_name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full space-y-6">
        {/* Assigned Bus Card */}
        {driverProfile.bus ? (
          <>
            <Card className="overflow-hidden">
              <div className="bg-primary/5 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground">Assigned Bus</span>
                  <Badge 
                    variant={isTripActive ? "default" : "secondary"}
                    className={isTripActive ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {isTripActive ? "On Trip" : "Off Duty"}
                  </Badge>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary text-primary-foreground mb-4">
                    <span className="text-3xl font-bold">{driverProfile.bus.bus_number}</span>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Route className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Route</p>
                      <p className="font-medium text-sm">{driverProfile.bus.route_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-medium text-sm">{driverProfile.bus.status}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Control Buttons */}
            <div className="space-y-3">
              {/* Start/End Trip Button */}
              <Button 
                className={`w-full h-16 text-lg font-semibold ${
                  isTripActive 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
                onClick={handleTripToggle}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                    Updating...
                  </>
                ) : isTripActive ? (
                  <>
                    <Square className="w-6 h-6 mr-3" />
                    End Trip
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 mr-3" />
                    Start Trip
                  </>
                )}
              </Button>

              {isTripActive && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Navigation className="w-4 h-4 animate-pulse text-primary" />
                  GPS tracking is active automatically
                </div>
              )}

              {!isTripActive && (
                <p className="text-xs text-muted-foreground text-center">
                  Start your trip to enable GPS tracking
                </p>
              )}
            </div>

            {/* GPS Status Indicator */}
            {isTripActive && (
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-700 dark:text-blue-300">GPS Active</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Updating continuously on movement
                      </p>
                    </div>
                  </div>
                  
                  {gpsTracking.isTracking && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-200 dark:border-blue-700">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-[10px] text-blue-500 uppercase">Coordinates</p>
                          <p className="text-xs font-mono text-blue-700 dark:text-blue-300">
                            {gpsTracking.latitude?.toFixed(5) ?? '--'}, {gpsTracking.longitude?.toFixed(5) ?? '--'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-[10px] text-blue-500 uppercase">Speed</p>
                          <p className="text-xs font-mono text-blue-700 dark:text-blue-300">
                            {gpsTracking.speed !== null ? `${gpsTracking.speed} km/h` : '-- km/h'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {gpsTracking.lastUpdated && (
                    <p className="text-[10px] text-blue-500 text-center">
                      Last updated: {gpsTracking.lastUpdated.toLocaleTimeString()}
                    </p>
                  )}
                  
                  {gpsTracking.error && (
                    <div className="text-xs text-center space-y-1">
                      <p className="text-red-500">⚠️ {gpsTracking.error}</p>
                      <p className="text-blue-500">GPS works on real devices. The preview iframe may block location access.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Driver Location Map */}
            {isTripActive && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <p className="font-medium text-foreground">Your Location</p>
                  </div>
                  <BusMap
                    bus={gpsTracking.latitude && gpsTracking.longitude ? {
                      id: driverProfile.bus!.id,
                      bus_number: driverProfile.bus!.bus_number,
                      route_name: driverProfile.bus!.route_name,
                      status: driverProfile.bus!.status as 'active' | 'delayed' | 'maintenance',
                      current_lat: gpsTracking.latitude,
                      current_lng: gpsTracking.longitude,
                      speed: gpsTracking.speed,
                      eta: null,
                      driver_name: driverProfile.full_name,
                      last_updated: gpsTracking.lastUpdated?.toISOString() ?? null,
                      created_at: '',
                    } : undefined}
                    className="h-64 md:h-80"
                  />
                  {!gpsTracking.latitude && (
                    <p className="text-xs text-muted-foreground text-center">
                      Enable GPS sharing to see your location on the map
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Bus className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No bus assigned to you yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Contact the transport office for assignment.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}