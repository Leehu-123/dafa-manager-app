'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import Link from 'next/link';

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    role: string;
    image?: string | null;
  };
}

import { signOut } from 'next-auth/react';

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none rounded-full"
      >
        <Avatar name={user.name} src={user.image} size="sm" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-dafa-white ring-1 ring-black ring-opacity-5 divide-y divide-dafa-border z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3">
            <p className="text-sm text-dafa-text font-medium truncate">{user.name}</p>
            <p className="text-xs text-dafa-muted truncate">{user.email}</p>
            <div className="mt-1 px-2 py-0.5 bg-gray-100 text-xs text-dafa-muted rounded-full inline-block">
              {user.role}
            </div>
          </div>
          
          <div className="py-1">
            <Link 
              href="/profile" 
              className="group flex items-center px-4 py-2 text-sm text-dafa-text hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="mr-3 h-4 w-4 text-dafa-muted group-hover:text-dafa-accent" />
              Hồ sơ cá nhân
            </Link>
            <Link 
              href="/settings" 
              className="group flex items-center px-4 py-2 text-sm text-dafa-text hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="mr-3 h-4 w-4 text-dafa-muted group-hover:text-dafa-accent" />
              Cài đặt
            </Link>
          </div>
          
          <div className="py-1">
            <button 
              className="group flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              onClick={() => {
                signOut({ callbackUrl: '/login' });
                setIsOpen(false);
              }}
            >
              <LogOut className="mr-3 h-4 w-4 text-red-500 group-hover:text-red-600" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
