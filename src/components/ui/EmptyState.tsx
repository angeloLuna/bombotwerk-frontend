import React from 'react';
import Link from 'next/link';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
  onClick?: () => void;
}

/**
 * Branded empty state shown when a page has no data to display.
 */
export default function EmptyState({
  title = 'NADA POR AQUÍ AÚN',
  message = 'Esta sección no tiene artículos por el momento. Vuelve pronto.',
  actionLabel,
  actionHref,
  onClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6 py-16 px-4 text-center">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-brand-charcoal border border-white/10 flex items-center justify-center">
        <PackageOpen className="w-8 h-8 text-neutral-500" />
      </div>

      {/* Copy */}
      <div className="space-y-2 max-w-xs">
        <h3 className="font-display font-black text-sm tracking-widest text-white uppercase">
          {title}
        </h3>
        <p className="text-xs text-neutral-500 font-sans font-light leading-relaxed tracking-wide">
          {message}
        </p>
      </div>

      {/* Optional action */}
      {actionLabel && (actionHref || onClick) && (
        actionHref ? (
          <Link
            href={actionHref}
            onClick={onClick}
            className="text-[10px] tracking-widest font-display font-black text-brand-magenta border-b border-brand-magenta/40 pb-1 hover:border-brand-magenta transition-colors"
          >
            {actionLabel} →
          </Link>
        ) : (
          <button
            type="button"
            onClick={onClick}
            className="text-[10px] tracking-widest font-display font-black text-brand-magenta border-b border-brand-magenta/40 pb-1 hover:border-brand-magenta transition-colors focus:outline-none"
          >
            {actionLabel} →
          </button>
        )
      )}
    </div>
  );
}
