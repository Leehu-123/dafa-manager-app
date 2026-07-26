import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getRoleLabel } from '@/lib/utils';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  
  const user = {
    name: session.user.name || 'Người dùng',
    email: session.user.email || '',
    role: session.user.role || 'EMPLOYEE',
    roleLabel: getRoleLabel(session.user.role || 'EMPLOYEE'),
    image: null,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dafa-bg font-sans">
      <Sidebar user={user} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      
      <BottomNav />
    </div>
  );
}
