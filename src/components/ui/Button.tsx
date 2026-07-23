import React, { forwardRef } from 'react';
import Link from 'next/link';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, href, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-xl';
    
    const variants: Record<string, string> = {
      primary: 'bg-dafa-accent text-white hover:bg-dafa-accent-hover focus:ring-dafa-accent/30 hover:shadow-lg hover:shadow-[#A14F39]/20',
      secondary: 'bg-transparent border border-dafa-border text-dafa-text hover:bg-gray-50 focus:ring-gray-200',
      outline: 'bg-transparent border border-dafa-border text-dafa-text hover:bg-gray-50 focus:ring-gray-200',
      ghost: 'bg-transparent text-dafa-text hover:bg-gray-100 focus:ring-gray-200',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
    };
    
    const sizes: Record<string, string> = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-6 text-lg',
    };
    
    const classes = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`;
    
    const content = (
      <>
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </>
    );

    if (href) {
      return (
        <Link href={href} className={classes}>
          {content}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} disabled={isLoading || disabled} {...props}>
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
