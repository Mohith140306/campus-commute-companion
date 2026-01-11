import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { BusMap } from '@/components/BusMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockBuses, getStatusColor, getStatusText, type Bus } from '@/lib/mockData';
import { useFavourites } from '@/hooks/useFavourites';
import { Bus as BusIcon, Clock, Navigation, Phone, Users, Star } from 'lucide-react';

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
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-foreground mb-2">Search Bus Number</label>
                <Input
                  placeholder="e.g., CB-101"
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
                          <span className="font-medium">{bus.busNumber}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-sm text-muted-foreground">{bus.routeName}</span>
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
          </div>

          {/* Bus Details */}
          {trackedBus && (
            <div className="space-y-4">
              {/* Status Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-foreground">{trackedBus.busNumber}</h2>
                      <button
                        onClick={() => toggleFavourite(trackedBus.busNumber)}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Star 
                          className={`w-5 h-5 ${
                            isFavourite(trackedBus.busNumber) 
                              ? 'fill-amber-500 text-amber-500' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                      </button>
                    </div>
                    <p className="text-muted-foreground text-sm">{trackedBus.routeName}</p>
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
                      <div className="font-semibold text-foreground">{trackedBus.eta}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Navigation className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Speed</div>
                      <div className="font-semibold text-foreground">{trackedBus.speed} km/h</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-foreground mb-3">Live Location</h3>
                <BusMap bus={trackedBus} />
              </div>

              {/* Driver Info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-foreground mb-3">Driver Information</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[hsl(195,72%,35%)] flex items-center justify-center text-white font-bold text-lg">
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
                    className="p-3 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!trackedBus && (
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
