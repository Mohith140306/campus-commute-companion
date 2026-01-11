import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { BusMap } from '@/components/BusMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockBuses, getStatusColor, getStatusText, type Bus } from '@/lib/mockData';
import { useFavourites } from '@/hooks/useFavourites';
import { Search, Clock, Navigation, Phone, Users, Star } from 'lucide-react';

export default function TrackBus() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusId, setSelectedBusId] = useState<string>('');
  const [trackedBus, setTrackedBus] = useState<Bus | null>(null);
  const { isFavourite, toggleFavourite } = useFavourites();

  const filteredBuses = mockBuses.filter(bus =>
    bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bus.routeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTrackBus = () => {
    if (selectedBusId) {
      const bus = mockBuses.find(b => b.id === selectedBusId);
      setTrackedBus(bus || null);
    }
  };

  const handleSelectBus = (busId: string) => {
    setSelectedBusId(busId);
    const bus = mockBuses.find(b => b.id === busId);
    if (bus) {
      setSearchQuery(bus.busNumber);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Track Bus" 
        subtitle="Search and track any college bus"
      />

      <main className="px-4 -mt-4 pb-8 safe-bottom">
        <div className="container max-w-lg mx-auto space-y-4">
          {/* Search Section */}
          <div className="card-elevated p-4 animate-fade-in">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by bus number or route..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedBusId} onValueChange={handleSelectBus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a bus" />
                </SelectTrigger>
                <SelectContent>
                  {filteredBuses.map(bus => (
                    <SelectItem key={bus.id} value={bus.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{bus.busNumber}</span>
                        <span className="text-muted-foreground">-</span>
                        <span className="text-sm text-muted-foreground">{bus.routeName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                onClick={handleTrackBus} 
                className="w-full gradient-primary text-primary-foreground"
                disabled={!selectedBusId}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Track Bus
              </Button>
            </div>
          </div>

          {/* Bus Details */}
          {trackedBus && (
            <div className="space-y-4 animate-fade-in">
              {/* Status Card */}
              <div className="card-elevated p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-foreground">{trackedBus.busNumber}</h2>
                      <button
                        onClick={() => toggleFavourite(trackedBus.busNumber)}
                        className="p-1.5 rounded-full hover:bg-secondary transition-colors"
                      >
                        <Star 
                          className={`w-5 h-5 ${
                            isFavourite(trackedBus.busNumber) 
                              ? 'fill-warning text-warning' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                      </button>
                    </div>
                    <p className="text-muted-foreground text-sm">{trackedBus.routeName}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-sm font-medium text-primary-foreground ${getStatusColor(trackedBus.status)}`}>
                    {getStatusText(trackedBus.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">ETA</div>
                      <div className="font-semibold text-foreground">{trackedBus.eta}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                      <Navigation className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Speed</div>
                      <div className="font-semibold text-foreground">{trackedBus.speed} km/h</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="card-elevated p-4">
                <h3 className="font-semibold text-foreground mb-3">Live Location</h3>
                <BusMap bus={trackedBus} />
              </div>

              {/* Driver Info */}
              <div className="card-elevated p-4">
                <h3 className="font-semibold text-foreground mb-3">Driver Information</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                      {trackedBus.driverName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{trackedBus.driverName}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Capacity: {trackedBus.capacity} seats
                      </div>
                    </div>
                  </div>
                  <a
                    href={`tel:${trackedBus.driverPhone}`}
                    className="p-3 rounded-full bg-success text-success-foreground hover:opacity-90 transition-opacity"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!trackedBus && (
            <div className="card-elevated p-8 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
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
