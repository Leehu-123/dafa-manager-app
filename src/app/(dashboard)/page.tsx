import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userId = session.user.id;
  const companyId = session.user.companyId;
  const role = session.user.role;

  let roleWhere: any = { companyId };
  if (role === 'MANAGER') {
    const managerDepts = await prisma.departmentMember.findMany({
      where: { userId },
      select: { departmentId: true }
    });
    const deptIds = managerDepts.map(d => d.departmentId);
    if (deptIds.length > 0) {
      roleWhere.OR = [
        { departmentId: { in: deptIds } },
        { assignees: { some: { user: { departmentMember: { some: { departmentId: { in: deptIds } } } } } } },
        { createdById: userId }
      ];
    } else {
      roleWhere.assignees = { some: { userId } };
    }
  } else if (role === 'EMPLOYEE') {
    roleWhere.assignees = { some: { userId } };
  }

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
    prisma.task.count({ where: roleWhere }),
    // By status
    prisma.task.count({ where: { ...roleWhere, status: 'TODO' } }),
    prisma.task.count({ where: { ...roleWhere, status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { ...roleWhere, status: 'DONE' } }),
    prisma.task.count({ where: { ...roleWhere, status: 'OVERDUE' } }),
    prisma.task.count({ where: { ...roleWhere, status: 'REVIEW' } }),
    // Recent tasks
    prisma.task.findMany({
      where: roleWhere,
      include: {
        assignees: { include: { user: { select: { fullName: true, avatar: true } } } },
        department: { select: { name: true, code: true } },
        createdBy: { select: { fullName: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    }),
    // Departments with task counts (admin only)
    role === 'ADMIN'
      ? prisma.department.findMany({
          where: { isActive: true, branch: { companyId } },
          include: {
            _count: { select: { tasks: true, members: true } },
            branch: { select: { name: true } },
          },
        })
      : Promise.resolve([]),
    // User count
    role === 'ADMIN'
      ? prisma.user.count({ where: { isActive: true, companyId } })
      : Promise.resolve(0),
  ]);

  // Calculate overdue from deadline
  const overdueByDeadline = await prisma.task.count({
    where: {
      ...roleWhere,
      deadline: { lt: new Date() },
      status: { notIn: ['DONE', 'OVERDUE'] },
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
