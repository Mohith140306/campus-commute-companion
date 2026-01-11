import { Bus } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="bg-[hsl(195,72%,35%)] text-white px-6 py-5">
      <div className="container max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Bus className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold">College Bus Tracker</h1>
            <p className="text-white/80 text-sm">Track • Navigate • Travel Safe</p>
          </div>
        </div>
      </div>
    </header>
  );
}
