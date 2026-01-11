import { Bus } from '@/components/ui/icons';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
}

export function PageHeader({ title, subtitle, showBack = true, backTo = '/' }: PageHeaderProps) {
  return (
    <header className="gradient-hero text-primary-foreground px-4 pt-6 pb-8 safe-top">
      <div className="container max-w-lg mx-auto">
        {showBack && (
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
        )}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            {subtitle && (
              <p className="text-primary-foreground/70 text-sm">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
