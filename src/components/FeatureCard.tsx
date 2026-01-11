import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconBgClass: string;
  iconColorClass?: string;
  to: string;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  iconBgClass,
  iconColorClass = 'text-current',
  to,
}: FeatureCardProps) {
  return (
    <Link to={to} className="block">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow h-full">
        <div className={`w-12 h-12 rounded-xl ${iconBgClass} flex items-center justify-center mb-4`}>
          <Icon className={`w-6 h-6 ${iconColorClass}`} />
        </div>
        <h3 className="font-semibold text-foreground text-lg mb-1">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  );
}
