import React from 'react';
import Button from './Button';

interface StickyCTAProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  price?: number;
  icon?: React.ReactNode;
}

const StickyCTA: React.FC<StickyCTAProps> = ({
  label,
  onClick,
  disabled = false,
  price,
  icon,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:sticky md:bottom-auto md:top-24 bg-brand-dark/95 backdrop-blur-lg border-t border-white/10 p-4 md:p-0 md:bg-transparent md:border-none md:shadow-none shadow-2xl">
      <div className="max-w-md mx-auto flex items-center gap-4 justify-between md:flex-col md:items-stretch">
        {price !== undefined && (
          <div className="flex flex-col md:hidden">
            <span className="text-[10px] text-neutral-400 tracking-wider">PRECIO</span>
            <span className="text-lg font-bold">${price.toLocaleString()} MXN</span>
          </div>
        )}
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={onClick}
          disabled={disabled}
          className="flex items-center justify-center gap-2 flex-1 md:flex-none shadow-magenta-glow"
        >
          {icon}
          {label}
        </Button>
      </div>
    </div>
  );
};

export default StickyCTA;
