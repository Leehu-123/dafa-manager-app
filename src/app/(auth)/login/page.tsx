import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Đăng nhập | DAFA Manager',
  description: 'Đăng nhập vào hệ thống quản lý DAFA Glass',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex w-full">
      {/* Left Panel - Brand Showcase (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-[#444444] to-[#A14F39] overflow-hidden items-center justify-center p-12">
        {/* Abstract decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative z-10 w-full max-w-lg">
          <div className="mb-12 animate-in fade-in slide-in-from-left-8 duration-700 delay-150">
            {/* Fallback text if image missing */}
            <div className="text-4xl font-black text-white tracking-wider mb-2">DAFA GLASS</div>
            <p className="text-white/80 text-xl font-light uppercase tracking-widest">Kính chuẩn. Nhà sang.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <h3 className="text-2xl font-bold text-white mb-4">Hệ thống Quản trị</h3>
            <p className="text-white/80 leading-relaxed">
              Giải pháp toàn diện để quản lý công việc, theo dõi tiến độ sản xuất, đánh giá hiệu suất nhân sự và tối ưu hóa quy trình kinh doanh của DAFA Glass.
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-dafa-bg p-8 sm:p-12 lg:p-24">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-12 text-center">
          <div className="text-3xl font-black text-dafa-primary tracking-wider mb-1">DAFA GLASS</div>
          <p className="text-dafa-accent text-sm font-medium uppercase tracking-widest">Kính chuẩn. Nhà sang.</p>
        </div>
        
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
