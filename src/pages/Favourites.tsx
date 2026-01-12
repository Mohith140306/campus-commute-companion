import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBuses, getStatusColor, getStatusText } from '@/hooks/useBuses';
import { useFavourites } from '@/hooks/useFavourites';
import { Star, Navigation, Plus, Trash2, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Favourites() {
  const navigate = useNavigate();
  const { favourites, addFavourite, removeFavourite } = useFavourites();
  const [selectedBusId, setSelectedBusId] = useState<string>('');

  const { data: buses, isLoading } = useBuses();

  const favouriteBuses = buses?.filter(bus => favourites.includes(bus.bus_number)) || [];
  const availableBuses = buses?.filter(bus => !favourites.includes(bus.bus_number)) || [];

  const handleAddFavourite = () => {
    if (selectedBusId && buses) {
      const bus = buses.find(b => b.id === selectedBusId);
      if (bus) {
        addFavourite(bus.bus_number);
        setSelectedBusId('');
        toast.success(`${bus.bus_number} added to favourites!`);
      }
    }
  };

  const handleRemoveFavourite = (busNumber: string) => {
    removeFavourite(busNumber);
    toast.success(`${busNumber} removed from favourites`);
  };

  const handleTrackBus = (busId: string) => {
    navigate(`/track?bus=${busId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="My Favourites" 
        subtitle="Quick access to your saved bus routes"
        icon={Star}
        iconColorClass="bg-amber-100 text-amber-600"
      />

      <main className="px-6 pb-8">
        <div className="container max-w-4xl mx-auto space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Loading buses...</p>
            </div>
          ) : (
            <>
              {/* Add Favourite Section */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-foreground mb-3">Add to Favourites</h3>
                <div className="flex gap-2">
                  <Select value={selectedBusId} onValueChange={setSelectedBusId}>
                    <SelectTrigger className="flex-1 h-12">
                      <SelectValue placeholder="Select a bus" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBuses.length > 0 ? (
                        availableBuses.map(bus => (
                          <SelectItem key={bus.id} value={bus.id}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{bus.bus_number}</span>
                              <span className="text-muted-foreground">-</span>
                              <span className="text-sm text-muted-foreground">{bus.route_name}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                          All buses are in favourites
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddFavourite}
                    disabled={!selectedBusId}
                    className="h-12 px-4 bg-amber-500 hover:bg-amber-600 text-white shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Favourites List */}
              {favouriteBuses.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground px-1">Your Favourites</h3>
                  {favouriteBuses.map((bus) => (
                    <div
                      key={bus.id}
                      className="bg-white rounded-2xl border border-gray-100 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{bus.bus_number}</h4>
                            <p className="text-sm text-muted-foreground">{bus.route_name}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(bus.status)}`}>
                                {getStatusText(bus.status)}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                ETA: {bus.eta || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTrackBus(bus.id)}
                          >
                            <Navigation className="w-3 h-3 mr-1" />
                            Track
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleRemoveFavourite(bus.bus_number)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-100 mx-auto mb-4 flex items-center justify-center">
                    <Star className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">No Favourites Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Add buses to your favourites for quick access to tracking.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
