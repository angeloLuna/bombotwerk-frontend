import React from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
  onRetry?: () => void;
}

/**
 * Branded error state card using the magenta border system.
 */
export default function ErrorState({
  title = 'CONNECTION ERROR',
  message = 'We could not load the data right now. The server may be unavailable.',
  actionLabel,
  actionHref,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6 py-16 px-4 text-center">
      {/* Icon + border card */}
      <div className="relative w-20 h-20 rounded-full bg-brand-dark border border-brand-magenta/30 flex items-center justify-center shadow-magenta-glow">
        <AlertTriangle className="w-8 h-8 text-brand-magenta" />
      </div>

      {/* Copy */}
      <div className="max-w-sm space-y-2 border border-brand-magenta/20 bg-brand-charcoal/60 p-6 rounded-xl">
        <h3 className="font-display font-black text-sm tracking-widest text-brand-magenta uppercase">
          {title}
        </h3>
        <p className="text-xs text-neutral-400 font-sans font-light leading-relaxed tracking-wide">
          {message}
        </p>
      </div>

      {/* Retry or navigate */}
      <div className="flex items-center gap-6">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 text-[10px] tracking-widest font-display font-black text-white border-b border-white/20 pb-1 hover:border-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> RETRY
          </button>
        )}
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="text-[10px] tracking-widest font-display font-black text-brand-magenta border-b border-brand-magenta/40 pb-1 hover:border-brand-magenta transition-colors"
          >
            {actionLabel} →
          </Link>
        )}
      </div>
    </div>
  );
}
