import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline' | 'destructive';
  children: React.ReactNode;
}

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors';
  
  const variants: Record<string, string> = {
    default: 'bg-gray-100 text-dafa-text',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    destructive: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-600 border border-gray-200',
    outline: 'bg-transparent text-dafa-text border border-dafa-border',
  };

  return (
    <span className={`${baseStyles} ${variants[variant] || variants.default} ${className}`} {...props}>
      {children}
    </span>
  );
}
