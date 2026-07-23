'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className = '' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div 
        className={`relative bg-dafa-white rounded-xl shadow-xl border border-dafa-border w-full max-w-md mx-auto z-10 animate-in fade-in zoom-in-95 duration-200 ${className}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-dafa-border">
          <h3 className="text-lg font-semibold text-dafa-text">{title}</h3>
          <button 
            onClick={onClose}
            className="text-dafa-muted hover:text-dafa-text transition-colors rounded-full p-1 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
