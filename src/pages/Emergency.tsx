import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Wrench, Car, Stethoscope, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface EmergencyType {
  id: string;
  type: 'breakdown' | 'accident' | 'medical' | 'women_safety';
  title: string;
  description: string;
  icon: typeof Wrench;
  colorClass: string;
  bgClass: string;
}

const emergencyTypes: EmergencyType[] = [
  {
    id: '1',
    type: 'breakdown',
    title: 'Bus Breakdown',
    description: 'Report a bus that has broken down',
    icon: Wrench,
    colorClass: 'text-warning',
    bgClass: 'bg-warning/10 hover:bg-warning/20',
  },
  {
    id: '2',
    type: 'accident',
    title: 'Accident',
    description: 'Report an accident or collision',
    icon: Car,
    colorClass: 'text-destructive',
    bgClass: 'bg-destructive/10 hover:bg-destructive/20',
  },
  {
    id: '3',
    type: 'medical',
    title: 'Medical Emergency',
    description: 'Request medical assistance',
    icon: Stethoscope,
    colorClass: 'text-emergency',
    bgClass: 'bg-emergency/10 hover:bg-emergency/20',
  },
  {
    id: '4',
    type: 'women_safety',
    title: 'Women Safety',
    description: 'Report safety concerns for women',
    icon: ShieldAlert,
    colorClass: 'text-accent',
    bgClass: 'bg-accent/10 hover:bg-accent/20',
  },
];

export default function Emergency() {
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyType | null>(null);
  const [message, setMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleEmergencySelect = (emergency: EmergencyType) => {
    setSelectedEmergency(emergency);
    setIsDialogOpen(true);
  };

  const handleSubmitEmergency = async () => {
    if (!selectedEmergency) return;

    setIsSubmitting(true);

    // Simulate API call - will be replaced with Supabase
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock saving to backend
    const emergencyReport = {
      id: Date.now().toString(),
      type: selectedEmergency.type,
      message: message || undefined,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    console.log('Emergency Report:', emergencyReport);

    setIsSubmitting(false);
    setIsDialogOpen(false);
    setIsSuccess(true);
    setMessage('');

    toast.success('Emergency reported successfully!', {
      description: 'Help is on the way. Stay calm.',
    });

    // Reset success state after 3 seconds
    setTimeout(() => {
      setIsSuccess(false);
      setSelectedEmergency(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Emergency" 
        subtitle="Report emergencies and get help"
      />

      <main className="px-4 -mt-4 pb-8 safe-bottom">
        <div className="container max-w-lg mx-auto">
          {/* Success State */}
          {isSuccess ? (
            <div className="card-elevated p-8 text-center animate-scale-in">
              <div className="w-20 h-20 rounded-full bg-success/10 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Emergency Reported</h3>
              <p className="text-muted-foreground">
                Your emergency has been reported successfully. The transport team has been notified and help is on the way.
              </p>
              <div className="mt-4 p-3 bg-success/10 rounded-lg text-sm text-success font-medium">
                Reference: EMG-{Date.now().toString().slice(-6)}
              </div>
            </div>
          ) : (
            <>
              {/* Warning Banner */}
              <div className="card-elevated p-4 mb-4 bg-emergency/5 border-emergency/20 animate-fade-in">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-emergency shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Report Emergencies Only</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      This feature is for genuine emergencies only. False reports may result in disciplinary action.
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Options */}
              <div className="grid grid-cols-2 gap-3">
                {emergencyTypes.map((emergency, index) => (
                  <button
                    key={emergency.id}
                    onClick={() => handleEmergencySelect(emergency)}
                    className={`card-elevated p-4 text-left transition-all animate-fade-in ${emergency.bgClass}`}
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <div className={`w-14 h-14 rounded-2xl ${emergency.bgClass} flex items-center justify-center mb-3`}>
                      <emergency.icon className={`w-7 h-7 ${emergency.colorClass}`} />
                    </div>
                    <h4 className="font-semibold text-foreground">{emergency.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{emergency.description}</p>
                  </button>
                ))}
              </div>

              {/* Emergency Contact */}
              <div className="card-elevated p-4 mt-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <h4 className="font-semibold text-foreground mb-2">Emergency Contacts</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transport Office:</span>
                    <a href="tel:+918012345678" className="font-medium text-primary">+91 80-1234-5678</a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Security:</span>
                    <a href="tel:+918012345679" className="font-medium text-primary">+91 80-1234-5679</a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medical:</span>
                    <a href="tel:108" className="font-medium text-emergency">108</a>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {selectedEmergency && (
                <selectedEmergency.icon className={`w-5 h-5 ${selectedEmergency.colorClass}`} />
              )}
              Report {selectedEmergency?.title}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately notify the transport team about your emergency.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-2">
            <Textarea
              placeholder="Add additional details (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitEmergency}
              disabled={isSubmitting}
              className="gradient-emergency text-emergency-foreground"
            >
              {isSubmitting ? 'Reporting...' : 'Report Emergency'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
