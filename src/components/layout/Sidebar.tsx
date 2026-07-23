'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FileText, 
  BarChart3, 
  Users, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
    roleLabel?: string;
    image?: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = user.role === 'ADMIN';
  const isManager = user.role === 'MANAGER';

  const navItems = [
    { name: 'Tổng quan', href: '/', icon: LayoutDashboard, adminOnly: false },
    { name: 'Công việc', href: '/tasks', icon: CheckSquare, adminOnly: false },
    { name: 'Báo cáo', href: '/reports', icon: FileText, adminOnly: false },
    { name: 'KPI', href: '/kpi', icon: BarChart3, adminOnly: false },
    { name: 'Nhân sự & Tổ chức', href: '/organization', icon: Users, adminOnly: true },
    { name: 'Cài đặt', href: '/settings', icon: Settings, adminOnly: true },
  ];

  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside 
      className={`hidden md:flex flex-col bg-[#2d2d2d] text-gray-300 transition-all duration-300 z-20 ${
        collapsed ? 'w-20' : 'w-64'
      } h-screen sticky top-0`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
        {!collapsed && (
          <div className="flex items-center space-x-2 overflow-hidden">
            <img src="/dafa-logo.png" alt="DAFA Logo" className="h-8 object-contain" />
          </div>
        )}
        {collapsed && (
          <div className="mx-auto">
            <div className="w-8 h-8 bg-dafa-primary rounded flex items-center justify-center text-white font-bold">
              D
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <ul className="space-y-1 px-2">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = item.icon;
            
            return (
              <li key={item.name} className="relative group">
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-dafa-accent/90 text-white' 
                      : 'hover:bg-white/10 hover:text-white'
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon size={20} className="shrink-0" />
                  {!collapsed && (
                    <span className="ml-3 font-medium text-sm truncate">{item.name}</span>
                  )}
                </Link>
                {collapsed && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-gray-700 p-4">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center space-x-3 overflow-hidden">
              <Avatar name={user.name} src={user.image} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.roleLabel || user.role}</p>
              </div>
            </div>
          )}
          {collapsed && <Avatar name={user.name} src={user.image} size="sm" />}
        </div>
        
        <div className={`mt-4 flex ${collapsed ? 'flex-col space-y-2' : 'items-center justify-between'}`}>
          <button 
            className={`text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors ${collapsed ? 'mx-auto' : ''}`}
            title="Đăng xuất"
          >
            <LogOut size={18} />
          </button>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className={`text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors ${collapsed ? 'mx-auto' : ''}`}
            title={collapsed ? "Mở rộng" : "Thu gọn"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
