import React from 'react';
import Image from 'next/image';
import { getInitials } from '@/lib/utils';

export interface AvatarProps {
  src?: string | null;
  initials?: string;
  name?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
  ringColor?: string;
  className?: string;
}

export function Avatar({ src, initials, name, fallback, size = 'md', ringColor, className = '' }: AvatarProps) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };
  
  const ringClass = ringColor ? `ring-2 ${ringColor} ring-offset-2 ring-offset-dafa-bg` : '';
  const baseClasses = `relative flex shrink-0 items-center justify-center rounded-full bg-dafa-accent/10 text-dafa-accent overflow-hidden font-semibold ${sizes[size]} ${ringClass} ${className}`;
  
  const displayInitials = initials || fallback || (name ? getInitials(name) : 'U');

  return (
    <div className={baseClasses} title={name}>
      {src ? (
        <Image 
          src={src} 
          alt={name || 'Avatar'} 
          fill
          className="object-cover"
        />
      ) : (
        <span>{displayInitials}</span>
      )}
    </div>
  );
}
