
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle, glow = false, ...props }) => {
  return (
    <div 
      className={`basalt-block p-6 relative overflow-hidden transition-all duration-300 group flex flex-col ${className}`}
      {...props}
    >
      {glow && (
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-400/5 rounded-full blur-[64px] group-hover:bg-yellow-400/10 transition-all duration-700 pointer-events-none"></div>
      )}
      {title && (
        <div className="flex-none mb-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-[10px] text-yellow-400 uppercase tracking-widest">// {title}</span>
            <div className="h-px bg-basalt-700 flex-1 group-hover:bg-yellow-400/30 transition-colors duration-500"></div>
          </div>
          {subtitle && (
            <span className="font-mono text-[9px] text-gray-600 uppercase tracking-wide">{subtitle}</span>
          )}
        </div>
      )}
      {/* Content area */}
      <div className="relative z-10 flex-1 min-h-0 w-full flex flex-col">
        {children}
      </div>
    </div>
  );
};
