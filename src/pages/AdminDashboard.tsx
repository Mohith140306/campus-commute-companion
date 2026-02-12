import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Shield,
  LogOut,
  Loader2,
  Bus,
  AlertTriangle,
  MessageSquare,
  MapPin,
  Gauge,
  Clock,
  RefreshCw,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAllBuses, useAllEmergencyReports, useAllFeedback, useUpdateBusStatus } from '@/hooks/useAdminData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import BusMap from '@/components/BusMap';
import AddBusDriverForm from '@/components/admin/AddBusDriverForm';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: buses, isLoading: busesLoading } = useAllBuses();
  const { data: emergencies, isLoading: emergenciesLoading } = useAllEmergencyReports();
  const { data: feedbackList, isLoading: feedbackLoading } = useAllFeedback();
  const updateBusStatus = useUpdateBusStatus();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);

  // Auth & role check
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
      return;
    }
    if (user) {
      supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }).then(({ data }) => {
        if (!data) {
          navigate('/admin/login');
        } else {
          setIsAdmin(true);
        }
      });
    }
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const handleStatusChange = async (busId: string, newStatus: string) => {
    try {
      await updateBusStatus.mutateAsync({ busId, status: newStatus });
      toast({ title: 'Bus Updated', description: `Status changed to ${newStatus}.` });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update bus status.' });
    }
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeBuses = buses?.filter((b) => b.status === 'active') ?? [];
  const delayedBuses = buses?.filter((b) => b.status === 'delayed') ?? [];
  const pendingEmergencies = emergencies?.filter((e) => e.status === 'pending') ?? [];

  // Find the selected bus object for the map
  const mapBus = buses?.find((b) => b.id === selectedBus) ?? undefined;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Transport Control Center</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-6xl mx-auto w-full space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{buses?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">Total Buses</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeBuses.length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{delayedBuses.length}</p>
                <p className="text-xs text-muted-foreground">Delayed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingEmergencies.length}</p>
                <p className="text-xs text-muted-foreground">Emergencies</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Section */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Live Bus Map</CardTitle>
              {buses && buses.length > 0 && (
                <Select value={selectedBus ?? ''} onValueChange={(v) => setSelectedBus(v || null)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select a bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {buses.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.bus_number} — {b.route_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <BusMap bus={mapBus} className="h-72 md:h-96" />
          </CardContent>
        </Card>

        {/* Tabs: Buses / Emergencies / Feedback */}
        <Tabs defaultValue="buses">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="buses" className="gap-1">
              <Bus className="w-4 h-4" />
              Buses
            </TabsTrigger>
            <TabsTrigger value="emergencies" className="gap-1">
              <AlertTriangle className="w-4 h-4" />
              Emergencies
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-1">
              <MessageSquare className="w-4 h-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="add" className="gap-1">
              <UserPlus className="w-4 h-4" />
              Add
            </TabsTrigger>
          </TabsList>

          {/* BUSES TAB */}
          <TabsContent value="buses" className="space-y-3 mt-4">
            {busesLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : buses?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No buses found.</p>
            ) : (
              buses?.map((bus) => (
                <Card key={bus.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-bold text-sm text-primary">{bus.bus_number}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{bus.route_name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {bus.driver_name && <span>Driver: {bus.driver_name}</span>}
                            {bus.speed !== null && (
                              <span className="flex items-center gap-1">
                                <Gauge className="w-3 h-3" /> {bus.speed} km/h
                              </span>
                            )}
                          </div>
                          {bus.current_lat && bus.current_lng && (
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                              📍 {Number(bus.current_lat).toFixed(4)}, {Number(bus.current_lng).toFixed(4)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={bus.status}
                          onValueChange={(val) => handleStatusChange(bus.id, val)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500" /> Active
                              </span>
                            </SelectItem>
                            <SelectItem value="delayed">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-orange-500" /> Delayed
                              </span>
                            </SelectItem>
                            <SelectItem value="maintenance">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-muted-foreground" /> Maintenance
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {bus.last_updated && (
                          <span className="text-[10px] text-muted-foreground hidden sm:inline">
                            <RefreshCw className="w-3 h-3 inline mr-1" />
                            {new Date(bus.last_updated).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* EMERGENCIES TAB */}
          <TabsContent value="emergencies" className="space-y-3 mt-4">
            {emergenciesLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : emergencies?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No emergency reports.</p>
            ) : (
              emergencies?.map((report) => (
                <Card key={report.id} className={report.status === 'pending' ? 'border-red-300 dark:border-red-800' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mt-0.5">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground capitalize">{report.emergency_type}</p>
                          {report.message && (
                            <p className="text-sm text-muted-foreground mt-1">{report.message}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Ref: {report.reference_id} • {new Date(report.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={report.status === 'pending' ? 'destructive' : 'secondary'}
                        className="shrink-0"
                      >
                        {report.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* FEEDBACK TAB */}
          <TabsContent value="feedback" className="space-y-3 mt-4">
            {feedbackLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : feedbackList?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No feedback submitted.</p>
            ) : (
              feedbackList?.map((fb) => (
                <Card key={fb.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <MessageSquare className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-1 capitalize">{fb.category}</Badge>
                          <p className="text-sm text-foreground">{fb.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(fb.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={fb.status === 'pending' ? 'secondary' : 'default'} className="shrink-0">
                        {fb.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          {/* ADD BUS & DRIVER TAB */}
          <TabsContent value="add" className="mt-4">
            <AddBusDriverForm />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
