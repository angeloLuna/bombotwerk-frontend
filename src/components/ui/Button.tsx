import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...rest
}) => {
  const baseStyles = 'font-sans font-bold uppercase tracking-widest transition-all duration-300 rounded-none inline-flex items-center justify-center text-center';
  
  const sizes = {
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-6 py-3 text-[11px]',
    lg: 'px-8 py-4 text-xs',
  };

  const variants = {
    primary: 'bg-brand-magenta text-black hover:bg-brand-magenta/80 shadow-magenta-glow border border-brand-magenta',
    secondary: 'bg-transparent border border-brand-magenta text-white hover:bg-brand-magenta/10',
    ghost: 'bg-transparent text-white hover:bg-white/10 border border-transparent',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${widthStyle} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
