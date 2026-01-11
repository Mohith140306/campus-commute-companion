import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockBuses, getStatusColor, getStatusText } from '@/lib/mockData';
import { useFavourites } from '@/hooks/useFavourites';
import { Star, Navigation, Plus, Trash2, Bus as BusIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Favourites() {
  const navigate = useNavigate();
  const { favourites, addFavourite, removeFavourite } = useFavourites();
  const [selectedBusId, setSelectedBusId] = useState<string>('');

  const favouriteBuses = mockBuses.filter(bus => favourites.includes(bus.busNumber));
  const availableBuses = mockBuses.filter(bus => !favourites.includes(bus.busNumber));

  const handleAddFavourite = () => {
    if (selectedBusId) {
      const bus = mockBuses.find(b => b.id === selectedBusId);
      if (bus) {
        addFavourite(bus.busNumber);
        setSelectedBusId('');
        toast.success(`${bus.busNumber} added to favourites!`);
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
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="My Favourites" 
        subtitle="Quick access to your saved buses"
      />

      <main className="px-4 -mt-4 pb-8 safe-bottom">
        <div className="container max-w-lg mx-auto space-y-4">
          {/* Add Favourite Section */}
          <div className="card-elevated p-4 animate-fade-in">
            <h3 className="font-semibold text-foreground mb-3">Add to Favourites</h3>
            <div className="flex gap-2">
              <Select value={selectedBusId} onValueChange={setSelectedBusId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a bus" />
                </SelectTrigger>
                <SelectContent>
                  {availableBuses.length > 0 ? (
                    availableBuses.map(bus => (
                      <SelectItem key={bus.id} value={bus.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{bus.busNumber}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-sm text-muted-foreground">{bus.routeName}</span>
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
                className="gradient-accent text-accent-foreground shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Favourites List */}
          {favouriteBuses.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground px-1">Your Favourites</h3>
              {favouriteBuses.map((bus, index) => (
                <div
                  key={bus.id}
                  className="card-elevated p-4 animate-fade-in"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                        <Star className="w-6 h-6 text-warning fill-warning" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{bus.busNumber}</h4>
                        <p className="text-sm text-muted-foreground">{bus.routeName}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-primary-foreground ${getStatusColor(bus.status)}`}>
                            {getStatusText(bus.status)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            ETA: {bus.eta}
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
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveFavourite(bus.busNumber)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-elevated p-8 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-warning/10 mx-auto mb-4 flex items-center justify-center">
                <Star className="w-8 h-8 text-warning" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No Favourites Yet</h3>
              <p className="text-sm text-muted-foreground">
                Add buses to your favourites for quick access to tracking.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
