import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconBgClass: string;
  to: string;
  badge?: string;
  badgeClass?: string;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  iconBgClass,
  to,
  badge,
  badgeClass = 'bg-accent text-accent-foreground',
}: FeatureCardProps) {
  return (
    <Link to={to} className="block">
      <div className="card-elevated p-4 flex items-center gap-4 group">
        <div className={`feature-icon ${iconBgClass} shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            {badge && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeClass}`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
            {description}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
      </div>
    </Link>
  );
}
