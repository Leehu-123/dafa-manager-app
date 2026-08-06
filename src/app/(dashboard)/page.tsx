import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { fetchFromCoreAPI } from '@/lib/api';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const role = session.user.role;
  const userName = session.user.name || session.user.email || '';
  const userId = session.user.id;

  try {
    const [data, announcementData, documentData] = await Promise.all([
      fetchFromCoreAPI('/dafa-tasks/dashboard-stats'),
      fetchFromCoreAPI('/company-documents?type=ANNOUNCEMENT&limit=10').catch(() => ({ items: [] })),
      fetchFromCoreAPI('/company-documents?type=DOCUMENT&limit=50').catch(() => ({ items: [] })),
    ]);

    return (
      <DashboardContent
        stats={data.stats}
        recentTasks={data.recentTasks}
        departments={data.departments || []}
        role={role}
        userName={userName}
        userId={userId}
        announcements={announcementData.items || announcementData || []}
        documents={documentData.items || documentData || []}
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
