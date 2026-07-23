import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userId = session.user.id;
  const role = session.user.role;

  // Fetch dashboard stats
  const [
    totalTasks,
    todoTasks,
    inProgressTasks,
    doneTasks,
    overdueTasks,
    reviewTasks,
    recentTasks,
    departments,
    userCount,
  ] = await Promise.all([
    // Total tasks visible to user
    prisma.task.count({
      where:
        role === 'ADMIN'
          ? {}
          : role === 'MANAGER'
          ? {
              department: {
                members: { some: { userId, isHead: true } },
              },
            }
          : { assignees: { some: { userId } } },
    }),
    // By status
    prisma.task.count({
      where: {
        status: 'TODO',
        ...(role === 'ADMIN'
          ? {}
          : role === 'MANAGER'
          ? { department: { members: { some: { userId, isHead: true } } } }
          : { assignees: { some: { userId } } }),
      },
    }),
    prisma.task.count({
      where: {
        status: 'IN_PROGRESS',
        ...(role === 'ADMIN'
          ? {}
          : role === 'MANAGER'
          ? { department: { members: { some: { userId, isHead: true } } } }
          : { assignees: { some: { userId } } }),
      },
    }),
    prisma.task.count({
      where: {
        status: 'DONE',
        ...(role === 'ADMIN'
          ? {}
          : role === 'MANAGER'
          ? { department: { members: { some: { userId, isHead: true } } } }
          : { assignees: { some: { userId } } }),
      },
    }),
    prisma.task.count({
      where: {
        status: 'OVERDUE',
        ...(role === 'ADMIN'
          ? {}
          : role === 'MANAGER'
          ? { department: { members: { some: { userId, isHead: true } } } }
          : { assignees: { some: { userId } } }),
      },
    }),
    prisma.task.count({
      where: {
        status: 'REVIEW',
        ...(role === 'ADMIN'
          ? {}
          : role === 'MANAGER'
          ? { department: { members: { some: { userId, isHead: true } } } }
          : { assignees: { some: { userId } } }),
      },
    }),
    // Recent tasks
    prisma.task.findMany({
      where:
        role === 'ADMIN'
          ? {}
          : role === 'MANAGER'
          ? { department: { members: { some: { userId, isHead: true } } } }
          : { assignees: { some: { userId } } },
      include: {
        assignees: { include: { user: { select: { fullName: true, avatarUrl: true } } } },
        department: { select: { name: true, code: true } },
        createdBy: { select: { fullName: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
    // Departments with task counts (admin only)
    role === 'ADMIN'
      ? prisma.department.findMany({
          where: { isActive: true },
          include: {
            _count: { select: { tasks: true, members: true } },
            branch: { select: { name: true } },
          },
        })
      : Promise.resolve([]),
    // User count
    role === 'ADMIN'
      ? prisma.user.count({ where: { status: 'ACTIVE' } })
      : Promise.resolve(0),
  ]);

  // Calculate overdue from deadline
  const overdueByDeadline = await prisma.task.count({
    where: {
      deadline: { lt: new Date() },
      status: { notIn: ['DONE', 'OVERDUE'] },
      ...(role === 'ADMIN'
        ? {}
        : role === 'MANAGER'
        ? { department: { members: { some: { userId, isHead: true } } } }
        : { assignees: { some: { userId } } }),
    },
  });

  const stats = {
    totalTasks,
    todoTasks,
    inProgressTasks,
    doneTasks,
    overdueTasks: overdueTasks + overdueByDeadline,
    reviewTasks,
    userCount,
    completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
  };

  return (
    <DashboardContent
      stats={stats}
      recentTasks={JSON.parse(JSON.stringify(recentTasks))}
      departments={JSON.parse(JSON.stringify(departments))}
      role={role}
      userName={session.user.name || ''}
    />
  );
}
