import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { SettingsForm } from '@/components/settings/SettingsForm';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/');

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId }
  });

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
              <p className="text-dafa-muted">{company?.name || "DAFA Glass"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-dafa-text">Mã công ty</label>
              <p className="text-dafa-muted">{company?.code}</p>
            </div>
          </div>
        </div>

        <SettingsForm initialToken={company?.telegramBotToken || ""} />
      </div>
    </div>
  );
}
