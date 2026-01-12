import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { BusMap } from '@/components/BusMap';
import { Button } from '@/components/ui/button';
import { useBuses, getStatusColor, getStatusText, type Bus } from '@/hooks/useBuses';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useFavourites } from '@/hooks/useFavourites';
import { MapPin, Navigation, Loader2, Star, Clock, Bus as BusIcon } from 'lucide-react';

interface BusWithDistance extends Bus {
  distance: number;
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format distance for display
function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export default function NearbyBuses() {
  const navigate = useNavigate();
  const { latitude, longitude, error, loading, getLocation } = useGeolocation();
  const { isFavourite, toggleFavourite } = useFavourites();
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  const { data: buses, isLoading: busesLoading } = useBuses();

  // Calculate nearby buses when location is available
  const nearbyBuses = useMemo(() => {
    if (!latitude || !longitude || !buses) return [];
    
    return buses
      .filter(bus => bus.status !== 'maintenance' && bus.current_lat && bus.current_lng)
      .map(bus => ({
        ...bus,
        distance: calculateDistance(
          latitude,
          longitude,
          bus.current_lat!,
          bus.current_lng!
        ),
      }))
      .sort((a, b) => a.distance - b.distance) as BusWithDistance[];
  }, [latitude, longitude, buses]);

  const handleSelectBus = (bus: Bus) => {
    setSelectedBus(bus);
  };

  const handleTrackBus = (busId: string) => {
    navigate(`/track?bus=${busId}`);
  };

  // Convert Bus to the format BusMap expects
  const mapBus = selectedBus ? {
    id: selectedBus.id,
    busNumber: selectedBus.bus_number,
    routeName: selectedBus.route_name,
    driverName: selectedBus.driver_name || 'Unknown',
    driverPhone: '',
    capacity: 45,
    status: selectedBus.status === 'active' ? 'running' as const : 
            selectedBus.status === 'delayed' ? 'delayed' as const : 'maintenance' as const,
    currentLocation: {
      lat: selectedBus.current_lat || 12.9716,
      lng: selectedBus.current_lng || 77.5946,
    },
    lastUpdated: selectedBus.last_updated || new Date().toISOString(),
    eta: selectedBus.eta || 'N/A',
    speed: selectedBus.speed || 0,
  } : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Nearby Buses" 
        subtitle="Find buses close to your current location"
        icon={MapPin}
        iconColorClass="bg-green-100 text-green-600"
      />

      <main className="px-6 pb-8">
        <div className="container max-w-4xl mx-auto space-y-4">
          {/* Location Detection */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <Button
              onClick={getLocation}
              disabled={loading}
              className="w-full h-12 bg-green-500 hover:bg-green-600 text-white text-base font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Detecting Location...
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5 mr-2" />
                  Detect My Location
                </>
              )}
            </Button>

            {error && (
              <div className="mt-3 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {latitude && longitude && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Location detected successfully
              </div>
            )}
          </div>

          {/* Loading state for buses */}
          {busesLoading && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Loading buses...</p>
            </div>
          )}

          {/* Map with selected bus */}
          {latitude && longitude && !busesLoading && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-foreground mb-3">
                {selectedBus ? `Tracking ${selectedBus.bus_number}` : 'Your Location'}
              </h3>
              <BusMap 
                bus={mapBus}
                studentLocation={{ lat: latitude, lng: longitude }}
              />
            </div>
          )}

          {/* Nearby Buses List */}
          {nearbyBuses.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground px-1">Buses Near You</h3>
              {nearbyBuses.map((bus) => (
                <div
                  key={bus.id}
                  className={`bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all ${
                    selectedBus?.id === bus.id ? 'border-primary' : 'border-gray-100 hover:border-gray-200'
                  }`}
                  onClick={() => handleSelectBus(bus)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[hsl(195,72%,35%)] flex items-center justify-center text-white shrink-0">
                        <BusIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{bus.bus_number}</h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavourite(bus.bus_number);
                            }}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <Star 
                              className={`w-4 h-4 ${
                                isFavourite(bus.bus_number) 
                                  ? 'fill-amber-500 text-amber-500' 
                                  : 'text-muted-foreground'
                              }`} 
                            />
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground">{bus.route_name}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {formatDistance(bus.distance)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {bus.eta || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(bus.status)}`}>
                        {getStatusText(bus.status)}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTrackBus(bus.id);
                        }}
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Track
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!latitude && !loading && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Enable Location</h3>
              <p className="text-sm text-muted-foreground">
                Tap "Detect My Location" to find buses near you.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
