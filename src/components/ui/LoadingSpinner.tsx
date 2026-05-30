import React from 'react';

/**
 * Full-page loading spinner using the Bombo Twerk brand magenta glow.
 */
export default function LoadingSpinner({ message = 'LOADING...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6 py-16">
      {/* Outer ring */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-brand-magenta/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-magenta animate-spin" />
        {/* Inner dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-brand-magenta animate-pulse shadow-magenta-glow" />
        </div>
      </div>
      <span className="text-[10px] tracking-widest font-display font-black text-brand-magenta animate-pulse">
        {message}
      </span>
    </div>
  );
}
