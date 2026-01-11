import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { BusMap } from '@/components/BusMap';
import { Button } from '@/components/ui/button';
import { mockBuses, calculateDistance, formatDistance, getStatusColor, getStatusText, type Bus } from '@/lib/mockData';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useFavourites } from '@/hooks/useFavourites';
import { MapPin, Navigation, Loader2, Star, Clock, Bus as BusIcon } from 'lucide-react';

interface BusWithDistance extends Bus {
  distance: number;
}

export default function NearbyBuses() {
  const navigate = useNavigate();
  const { latitude, longitude, error, loading, getLocation } = useGeolocation();
  const { isFavourite, toggleFavourite } = useFavourites();
  const [nearbyBuses, setNearbyBuses] = useState<BusWithDistance[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  // Calculate nearby buses when location is available
  useEffect(() => {
    if (latitude && longitude) {
      const busesWithDistance = mockBuses
        .filter(bus => bus.status !== 'maintenance')
        .map(bus => ({
          ...bus,
          distance: calculateDistance(
            latitude,
            longitude,
            bus.currentLocation.lat,
            bus.currentLocation.lng
          ),
        }))
        .sort((a, b) => a.distance - b.distance);

      setNearbyBuses(busesWithDistance);
    }
  }, [latitude, longitude]);

  const handleSelectBus = (bus: Bus) => {
    setSelectedBus(bus);
  };

  const handleTrackBus = (busId: string) => {
    navigate(`/track?bus=${busId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Nearby Buses" 
        subtitle="Find buses closest to you"
      />

      <main className="px-4 -mt-4 pb-8 safe-bottom">
        <div className="container max-w-lg mx-auto space-y-4">
          {/* Location Detection */}
          <div className="card-elevated p-4 animate-fade-in">
            <Button
              onClick={getLocation}
              disabled={loading}
              className="w-full gradient-success text-success-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Detecting Location...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Detect My Location
                </>
              )}
            </Button>

            {error && (
              <div className="mt-3 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {error}
              </div>
            )}

            {latitude && longitude && (
              <div className="mt-3 flex items-center gap-2 text-sm text-success">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Location detected successfully
              </div>
            )}
          </div>

          {/* Map with selected bus */}
          {latitude && longitude && (
            <div className="card-elevated p-4 animate-fade-in">
              <h3 className="font-semibold text-foreground mb-3">
                {selectedBus ? `Tracking ${selectedBus.busNumber}` : 'Your Location'}
              </h3>
              <BusMap 
                bus={selectedBus || undefined}
                studentLocation={{ lat: latitude, lng: longitude }}
              />
            </div>
          )}

          {/* Nearby Buses List */}
          {nearbyBuses.length > 0 && (
            <div className="space-y-2 animate-fade-in">
              <h3 className="font-semibold text-foreground px-1">Buses Near You</h3>
              {nearbyBuses.map((bus, index) => (
                <div
                  key={bus.id}
                  className={`card-elevated p-4 cursor-pointer transition-all ${
                    selectedBus?.id === bus.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelectBus(bus)}
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground shrink-0">
                        <BusIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{bus.busNumber}</h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavourite(bus.busNumber);
                            }}
                            className="p-1 rounded-full hover:bg-secondary transition-colors"
                          >
                            <Star 
                              className={`w-4 h-4 ${
                                isFavourite(bus.busNumber) 
                                  ? 'fill-warning text-warning' 
                                  : 'text-muted-foreground'
                              }`} 
                            />
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground">{bus.routeName}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {formatDistance(bus.distance)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {bus.eta}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium text-primary-foreground ${getStatusColor(bus.status)}`}>
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
            <div className="card-elevated p-8 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
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
