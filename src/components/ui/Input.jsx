import React, { forwardRef } from 'react';

export const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <input
        ref={ref}
        className={`px-3 py-2 bg-white border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-50 disabled:text-slate-500
          ${error 
            ? 'border-error focus:border-error focus:ring-error/20' 
            : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20 hover:border-slate-400'
          }`}
        {...props}
      />
      {error && <span className="text-xs text-error mt-0.5">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
