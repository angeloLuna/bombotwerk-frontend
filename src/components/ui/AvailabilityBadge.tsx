import React from 'react';
import { Truck, Sparkles, MapPin } from 'lucide-react';

interface AvailabilityBadgeProps {
  type: 'ready-to-ship' | 'crafted-cdmx' | 'limited-drop';
  text?: string;
  className?: string;
}

const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({
  type,
  text,
  className = '',
}) => {
  const configs = {
    'ready-to-ship': {
      label: text || 'Ships within 24h',
      icon: Truck,
      dotColor: 'bg-brand-magenta',
      bgColor: 'bg-brand-magenta/5 border-brand-magenta/20',
      textColor: 'text-brand-magenta',
    },
    'crafted-cdmx': {
      label: text || 'Crafted in CDMX — Ready in 5–7 days',
      icon: MapPin,
      dotColor: 'bg-brand-violet',
      bgColor: 'bg-brand-violet/5 border-brand-violet/20',
      textColor: 'text-brand-violet',
    },
    'limited-drop': {
      label: text || 'Limited Drop',
      icon: Sparkles,
      dotColor: 'bg-brand-gold',
      bgColor: 'bg-brand-gold/5 border-brand-gold/20',
      textColor: 'text-brand-gold',
    },
  };

  const current = configs[type];
  const Icon = current.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-[10px] tracking-wide font-sans ${current.bgColor} ${current.textColor} ${className}`}
    >
      <div className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.dotColor}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dotColor}`}></span>
      </div>
      <Icon className="w-3.5 h-3.5 opacity-80" />
      <span className="font-semibold uppercase tracking-wider">{current.label}</span>
    </div>
  );
};

export default AvailabilityBadge;
