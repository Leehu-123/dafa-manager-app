import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label?: string;
  error?: string;
  variant?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';
  options?: { label: string; value: string | number }[]; // For select variant
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, InputProps>(
  ({ className = '', label, error, variant = 'text', options, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    const baseStyles = 'flex w-full rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-dafa-accent focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors';
    
    const errorStyles = error ? 'border-red-500 focus:ring-red-500' : 'border-dafa-border';
    const classes = `${baseStyles} ${errorStyles} ${className}`;

    const renderInput = () => {
      if (variant === 'textarea') {
        return (
          <textarea
            id={inputId}
            ref={ref as any}
            className={`${classes} min-h-[80px]`}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        );
      }
      
      if (variant === 'select') {
        return (
          <select
            id={inputId}
            ref={ref as any}
            className={classes}
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      }

      return (
        <input
          id={inputId}
          type={variant}
          ref={ref as any}
          className={classes}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      );
    };

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-dafa-text">
            {label}
          </label>
        )}
        {renderInput()}
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
