import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-neutral-low">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.12] rounded-lg text-sm text-neutral-high placeholder:text-neutral-low/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all duration-200 ${
            error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-500 font-medium">{error}</span>
        )}
        {!error && helperText && (
          <span className="text-xs text-neutral-low/50">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
