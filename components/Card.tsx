
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: string;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, glow = false, ...props }) => {
  return (
    <div 
      className={`neu-card p-6 relative overflow-hidden transition-all duration-500 group flex flex-col ${className}`}
      {...props}
    >
      {glow && (
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-neu-primary/10 rounded-full blur-[64px] group-hover:bg-neu-primary/20 transition-all duration-700 pointer-events-none"></div>
      )}
      {title && (
        <div className="flex-none flex items-center gap-3 mb-6">
          <h3 className="text-sm font-semibold text-neu-text tracking-wide uppercase font-mono opacity-80 group-hover:opacity-100 transition-opacity">
            {title}
          </h3>
          <div className="h-px bg-neu-border flex-1 group-hover:bg-neu-primary/30 transition-colors duration-500"></div>
        </div>
      )}
      {/* Critical Fix: flex-1 min-h-0 allows the inner content (like Recharts) to expand filling the parent height */}
      <div className="relative z-10 flex-1 min-h-0 w-full flex flex-col">
        {children}
      </div>
    </div>
  );
};
