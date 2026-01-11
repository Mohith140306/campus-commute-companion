import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  icon?: LucideIcon;
  iconColorClass?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  showBack = true, 
  backTo = '/',
  icon: Icon,
  iconColorClass = 'bg-primary/10 text-primary'
}: PageHeaderProps) {
  return (
    <>
      <AppHeader />
      <div className="bg-background px-6 py-4">
        <div className="container max-w-4xl mx-auto">
          {showBack && (
            <Link
              to={backTo}
              className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-lg bg-[hsl(195,72%,35%)] text-white hover:bg-[hsl(195,72%,30%)] transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          )}
          <div className="flex items-center gap-4">
            {Icon && (
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColorClass}`}>
                <Icon className="w-6 h-6" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-foreground">{title}</h2>
              {subtitle && (
                <p className="text-muted-foreground text-sm mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
