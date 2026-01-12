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
import { Wrench, Car, Heart, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateEmergencyReport } from '@/hooks/useEmergencyReports';

interface EmergencyType {
  id: string;
  type: 'breakdown' | 'accident' | 'medical' | 'safety';
  title: string;
  description: string;
  icon: typeof Wrench;
  bgClass: string;
  iconBgClass: string;
}

const emergencyTypes: EmergencyType[] = [
  {
    id: '1',
    type: 'breakdown',
    title: 'Bus Breakdown',
    description: 'Report mechanical failure or breakdown',
    icon: Wrench,
    bgClass: 'bg-white border-gray-200 hover:border-orange-300',
    iconBgClass: 'bg-orange-500',
  },
  {
    id: '2',
    type: 'accident',
    title: 'Accident',
    description: 'Report road accident or collision',
    icon: Car,
    bgClass: 'bg-white border-red-200 hover:border-red-400',
    iconBgClass: 'bg-red-500',
  },
  {
    id: '3',
    type: 'medical',
    title: 'Medical Emergency',
    description: 'Request immediate medical assistance',
    icon: Heart,
    bgClass: 'bg-white border-gray-200 hover:border-pink-300',
    iconBgClass: 'bg-pink-500',
  },
  {
    id: '4',
    type: 'safety',
    title: 'Women Safety',
    description: 'Report safety concerns or harassment',
    icon: ShieldCheck,
    bgClass: 'bg-white border-gray-200 hover:border-purple-300',
    iconBgClass: 'bg-purple-500',
  },
];

export default function Emergency() {
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyType | null>(null);
  const [message, setMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  const createEmergencyReport = useCreateEmergencyReport();

  const handleEmergencySelect = (emergency: EmergencyType) => {
    setSelectedEmergency(emergency);
    setIsDialogOpen(true);
  };

  const handleSubmitEmergency = async () => {
    if (!selectedEmergency) return;

    try {
      const result = await createEmergencyReport.mutateAsync({
        emergency_type: selectedEmergency.type,
        message: message || undefined,
      });

      setReferenceId(result.reference_id);
      setIsDialogOpen(false);
      setIsSuccess(true);
      setMessage('');

      toast.success('Emergency reported successfully!', {
        description: 'Help is on the way. Stay calm.',
      });

      // Reset success state after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedEmergency(null);
        setReferenceId('');
      }, 5000);
    } catch (error) {
      toast.error('Failed to report emergency', {
        description: 'Please try again or call emergency contacts directly.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="Emergency" 
        subtitle="Report emergencies and get immediate help"
        icon={AlertTriangle}
        iconColorClass="bg-red-100 text-red-500"
      />

      <main className="px-6 pb-8">
        <div className="container max-w-4xl mx-auto">
          {/* Success State */}
          {isSuccess ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Emergency Reported</h3>
              <p className="text-muted-foreground">
                Your emergency has been reported successfully. The transport team has been notified and help is on the way.
              </p>
              <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-700 font-medium">
                Reference: {referenceId}
              </div>
            </div>
          ) : (
            <>
              {/* Warning Banner */}
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-red-600 text-sm font-medium">
                    Use only in genuine emergencies. False reports may be penalized.
                  </p>
                </div>
              </div>

              {/* Emergency Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emergencyTypes.map((emergency) => (
                  <button
                    key={emergency.id}
                    onClick={() => handleEmergencySelect(emergency)}
                    className={`rounded-2xl border-2 p-6 text-center transition-all ${emergency.bgClass}`}
                  >
                    <div className={`w-16 h-16 rounded-2xl ${emergency.iconBgClass} flex items-center justify-center mx-auto mb-4`}>
                      <emergency.icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-foreground text-lg">{emergency.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{emergency.description}</p>
                  </button>
                ))}
              </div>

              {/* Emergency Contact */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6">
                <h4 className="font-semibold text-foreground mb-3">Emergency Contacts</h4>
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
                    <a href="tel:108" className="font-medium text-red-500">108</a>
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
                <div className={`w-8 h-8 rounded-lg ${selectedEmergency.iconBgClass} flex items-center justify-center`}>
                  <selectedEmergency.icon className="w-4 h-4 text-white" />
                </div>
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
            <AlertDialogCancel disabled={createEmergencyReport.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitEmergency}
              disabled={createEmergencyReport.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {createEmergencyReport.isPending ? 'Reporting...' : 'Report Emergency'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
