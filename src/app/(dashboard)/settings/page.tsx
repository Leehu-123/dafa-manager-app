import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dafa-primary">Cài đặt hệ thống</h1>
        <p className="text-dafa-muted mt-1">Quản lý cấu hình ứng dụng</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-dafa-border/50 shadow-sm p-6">
          <h2 className="font-semibold text-dafa-primary text-lg mb-4">Thông tin công ty</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-dafa-text">Tên công ty</label>
              <p className="text-dafa-muted">DAFA Glass</p>
            </div>
            <div>
              <label className="text-sm font-medium text-dafa-text">Slogan</label>
              <p className="text-dafa-muted">Kính chuẩn. Nhà sang.</p>
            </div>
            <div>
              <label className="text-sm font-medium text-dafa-text">Website</label>
              <p className="text-dafa-accent">dafaglass.com</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-dafa-border/50 shadow-sm p-6">
          <h2 className="font-semibold text-dafa-primary text-lg mb-4">Cấu hình chung</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dafa-text">Thông báo email</p>
                <p className="text-xs text-dafa-muted">Gửi email khi có công việc mới</p>
              </div>
              <div className="w-10 h-5 bg-dafa-accent rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dafa-text">Nhắc nhở deadline</p>
                <p className="text-xs text-dafa-muted">Trước 1 ngày khi đến hạn</p>
              </div>
              <div className="w-10 h-5 bg-dafa-accent rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
