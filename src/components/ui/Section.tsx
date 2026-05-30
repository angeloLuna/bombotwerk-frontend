import React from 'react';

interface SectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  bg?: 'plum' | 'dark' | 'charcoal' | 'default';
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  id,
  title,
  subtitle,
  bg = 'default',
  children,
  className = '',
}) => {
  const bgClasses = {
    plum: 'bg-plum-gradient border-b border-white/5',
    dark: 'bg-brand-dark border-b border-white/5',
    charcoal: 'bg-brand-charcoal border-b border-white/5',
    default: 'bg-transparent',
  };

  return (
    <section
      id={id}
      className={`py-20 px-4 md:px-8 ${bgClasses[bg]} ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        {(title || subtitle) && (
          <div className="flex flex-col mb-12 space-y-1 text-left">
            {subtitle && (
              <span className="text-[10px] tracking-widest font-display text-brand-magenta font-black uppercase">
                {subtitle}
              </span>
            )}
            {title && (
              <h2 className="text-3xl md:text-5xl font-serif text-white uppercase tracking-wide">
                {title}
              </h2>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
