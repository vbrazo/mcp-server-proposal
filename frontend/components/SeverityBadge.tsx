import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

const severityConfig = {
  critical: {
    label: 'Critical',
    color: 'bg-red-500 text-white border-red-600',
    emoji: '🔴',
  },
  high: {
    label: 'High',
    color: 'bg-orange-500 text-white border-orange-600',
    emoji: '🟠',
  },
  medium: {
    label: 'Medium',
    color: 'bg-yellow-500 text-white border-yellow-600',
    emoji: '🟡',
  },
  low: {
    label: 'Low',
    color: 'bg-blue-500 text-white border-blue-600',
    emoji: '🔵',
  },
  info: {
    label: 'Info',
    color: 'bg-gray-500 text-white border-gray-600',
    emoji: '⚪',
  },
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  
  return (
    <Badge className={cn(config.color, 'font-medium', className)}>
      <span className="mr-1">{config.emoji}</span>
      {config.label}
    </Badge>
  );
}

