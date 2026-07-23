import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export function Card({ className = '', glass = false, children, ...props }: CardProps) {
  const baseStyles = 'rounded-xl overflow-hidden';
  const normalStyles = 'bg-dafa-white border border-dafa-border shadow-sm';
  const glassStyles = 'bg-white/70 backdrop-blur-md border border-white/20 shadow-lg';
  
  return (
    <div className={`${baseStyles} ${glass ? glassStyles : normalStyles} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 border-b border-dafa-border/50 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-lg font-semibold text-dafa-text ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 bg-gray-50/50 border-t border-dafa-border/50 ${className}`} {...props}>
      {children}
    </div>
  );
}
