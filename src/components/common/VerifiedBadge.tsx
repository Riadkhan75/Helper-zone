import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';

interface VerifiedBadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ 
  size = 'sm', 
  showLabel = false,
  className = '' 
}) => {
  const iconSize = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  const containerSize = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  return (
    <span 
      className={`inline-flex items-center gap-1 shrink-0 ${className}`} 
      title="ভেরিফাইড শিক্ষার্থী (Verified Student Badge)"
    >
      <span 
        className={`${containerSize} rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shadow-xs ring-1 ring-white dark:ring-slate-900`}
      >
        <Check className={`${iconSize} stroke-[3]`} />
      </span>
      {showLabel && (
        <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded-md border border-sky-200/60 dark:border-sky-800/60">
          ভেরিফাইড
        </span>
      )}
    </span>
  );
};
