import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, CheckCircle, Smartphone } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Install App" icon={Smartphone} />
      <main className="p-4 max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2 pt-6">
          <Smartphone className="w-16 h-16 text-primary mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Install Bus Tracker</h1>
          <p className="text-muted-foreground">Install for faster access and reliable GPS tracking</p>
        </div>

        {isInstalled ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-primary mx-auto" />
              <p className="font-semibold text-foreground">App is installed!</p>
              <p className="text-sm text-muted-foreground">You can find it on your home screen.</p>
            </CardContent>
          </Card>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} className="w-full h-14 text-lg">
            <Download className="w-5 h-5 mr-2" />
            Install App
          </Button>
        ) : (
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="font-medium text-foreground">How to install:</p>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p><strong>iPhone/iPad:</strong> Tap the Share button → "Add to Home Screen"</p>
                <p><strong>Android (Chrome):</strong> Tap the menu (⋮) → "Install app" or "Add to Home Screen"</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="font-medium text-foreground text-sm">Benefits of installing:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Opens like a native app (no browser bar)</li>
              <li>More reliable GPS tracking for drivers</li>
              <li>Screen stays active during trips</li>
              <li>Faster loading & works offline</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
