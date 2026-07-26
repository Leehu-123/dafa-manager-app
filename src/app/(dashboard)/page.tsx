import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { fetchFromCoreAPI } from '@/lib/api';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const role = session.user.role;
  const userName = session.user.name || session.user.email || '';

  try {
    const data = await fetchFromCoreAPI('/dafa-tasks/dashboard-stats');

    return (
      <DashboardContent
        stats={data.stats}
        recentTasks={data.recentTasks}
        departments={data.departments || []}
        role={role}
        userName={userName}
      />
    );
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return (
      <div className="p-8 text-center text-red-500">
        <h2>Không thể tải dữ liệu Dashboard</h2>
        <p>Vui lòng thử lại sau hoặc kiểm tra kết nối với Core API.</p>
      </div>
    );
  }
}
