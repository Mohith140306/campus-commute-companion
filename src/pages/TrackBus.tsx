import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { BusMap } from '@/components/BusMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBuses, getStatusColor, getStatusText, type Bus } from '@/hooks/useBuses';
import { useFavourites } from '@/hooks/useFavourites';
import { Bus as BusIcon, Clock, Navigation, Star, Loader2 } from 'lucide-react';

export default function TrackBus() {
  const [searchParams] = useSearchParams();
  const initialBusId = searchParams.get('bus') || '';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusId, setSelectedBusId] = useState<string>(initialBusId);
  const [trackedBus, setTrackedBus] = useState<Bus | null>(null);
  const { isFavourite, toggleFavourite } = useFavourites();

  const { data: buses, isLoading, error } = useBuses();

  const filteredBuses = useMemo(() => {
    if (!buses) return [];
    return buses.filter(bus =>
      bus.bus_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.route_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [buses, searchQuery]);

  const handleTrackBus = () => {
    if (selectedBusId && buses) {
      const bus = buses.find(b => b.id === selectedBusId);
      setTrackedBus(bus || null);
    }
  };

  const handleSelectBus = (busId: string) => {
    setSelectedBusId(busId);
    if (buses) {
      const bus = buses.find(b => b.id === busId);
      if (bus) {
        setSearchQuery(bus.bus_number);
      }
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Track Bus" 
        subtitle="Enter bus number to track location"
        icon={BusIcon}
        iconColorClass="bg-amber-500 text-white"
      />

      <main className="px-6 pb-8">
        <div className="container max-w-4xl mx-auto space-y-4">
          {/* Search Section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading buses...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Failed to load buses. Please try again.
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block font-medium text-foreground mb-2">Search Bus Number</label>
                  <Input
                    placeholder="e.g., KA-01-1234"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-sm text-primary font-medium tracking-wide">OR SELECT FROM LIST</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-2">Select Bus</label>
                  <Select value={selectedBusId} onValueChange={handleSelectBus}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Choose a bus" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredBuses.map(bus => (
                        <SelectItem key={bus.id} value={bus.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{bus.bus_number}</span>
                            <span className="text-muted-foreground">-</span>
                            <span className="text-sm text-muted-foreground">{bus.route_name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleTrackBus} 
                  className="w-full h-12 bg-[hsl(190,55%,55%)] hover:bg-[hsl(190,55%,50%)] text-white text-base font-medium"
                  disabled={!selectedBusId}
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  Track Bus
                </Button>
              </div>
            )}
          </div>

          {/* Bus Details */}
          {trackedBus && (
            <div className="space-y-4">
              {/* Status Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-foreground">{trackedBus.bus_number}</h2>
                      <button
                        onClick={() => toggleFavourite(trackedBus.bus_number)}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Star 
                          className={`w-5 h-5 ${
                            isFavourite(trackedBus.bus_number) 
                              ? 'fill-amber-500 text-amber-500' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                      </button>
                    </div>
                    <p className="text-muted-foreground text-sm">{trackedBus.route_name}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-sm font-medium text-white ${getStatusColor(trackedBus.status)}`}>
                    {getStatusText(trackedBus.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">ETA</div>
                      <div className="font-semibold text-foreground">{trackedBus.eta || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Navigation className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Speed</div>
                      <div className="font-semibold text-foreground">{trackedBus.speed || 0} km/h</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-foreground mb-3">Live Location</h3>
                {trackedBus && <BusMap bus={trackedBus} />}
              </div>

              {/* Driver Info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-foreground mb-3">Driver Information</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[hsl(195,72%,35%)] flex items-center justify-center text-white font-bold text-lg">
                    {(trackedBus.driver_name || 'U').charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{trackedBus.driver_name || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">
                      Last updated: {trackedBus.last_updated ? new Date(trackedBus.last_updated).toLocaleTimeString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!trackedBus && !isLoading && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                <Navigation className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Select a Bus to Track</h3>
              <p className="text-sm text-muted-foreground">
                Choose a bus from the dropdown above and tap "Track Bus" to see its live location.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
