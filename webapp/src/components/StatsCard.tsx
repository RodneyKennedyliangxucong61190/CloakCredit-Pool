import { LucideIcon } from 'lucide-react';
import { Card } from './ui/card';

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  change?: string;
  gradient?: boolean;
}

const StatsCard = ({ icon: Icon, title, value, change, gradient }: StatsCardProps) => {
  return (
    <Card className={`p-6 backdrop-blur-sm border-border/50 shadow-card hover:shadow-glow transition-all duration-300 ${
      gradient ? 'bg-gradient-primary text-primary-foreground' : 'bg-card/80'
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium mb-1 ${gradient ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
            {title}
          </p>
          <p className={`text-3xl font-bold mb-2 ${gradient ? 'text-primary-foreground' : 'text-foreground'}`}>
            {value}
          </p>
          {change && (
            <p className={`text-xs font-medium ${gradient ? 'text-primary-foreground/80' : 'text-accent'}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${gradient ? 'bg-white/20' : 'bg-primary-light'}`}>
          <Icon className={`w-5 h-5 ${gradient ? 'text-primary-foreground' : 'text-primary'}`} />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
