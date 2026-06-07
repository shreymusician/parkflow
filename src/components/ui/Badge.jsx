import React from 'react';

export function Badge({ children, variant = 'neutral', className = '' }) {
  const variants = {
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-rose-100 text-rose-800',
    primary: 'bg-primary-100 text-primary-800',
    neutral: 'bg-slate-100 text-slate-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
