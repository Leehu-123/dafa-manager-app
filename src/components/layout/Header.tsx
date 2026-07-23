'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { Input } from '../ui/Input';

interface HeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
    image?: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  
  // Simple breadcrumb logic based on pathname
  const getPageTitle = () => {
    if (!pathname) return 'Tổng quan';
    if (pathname.includes('/tasks')) return 'Công việc';
    if (pathname.includes('/reports')) return 'Báo cáo';
    if (pathname.includes('/kpi')) return 'KPI';
    if (pathname.includes('/organization')) return 'Nhân sự & Tổ chức';
    if (pathname.includes('/settings')) return 'Cài đặt';
    return 'Tổng quan';
  };

  return (
    <header className="h-16 bg-dafa-white border-b border-dafa-border flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
      <div className="flex items-center flex-1">
        <h1 className="text-lg font-semibold text-dafa-text hidden sm:block">
          {getPageTitle()}
        </h1>
        <div className="sm:hidden text-lg font-bold text-dafa-primary">
          DAFA Glass
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden md:block w-64">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-dafa-muted" />
            </div>
            <Input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="pl-10 h-9 bg-gray-50 border-transparent focus:bg-white"
            />
          </div>
        </div>
        
        <button className="relative p-2 text-dafa-muted hover:text-dafa-text rounded-full hover:bg-gray-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-dafa-accent border border-white"></span>
        </button>
        
        <div className="h-6 w-px bg-dafa-border mx-2"></div>
        
        <UserMenu user={user} />
      </div>
    </header>
  );
}
