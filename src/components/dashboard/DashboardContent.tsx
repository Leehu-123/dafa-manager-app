'use client';

import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  ArrowUpRight,
  ListTodo,
  Eye,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, getStatusLabel, getStatusColor, getPriorityLabel, getPriorityColor, getInitials } from '@/lib/utils';

interface DashboardStats {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  doneTasks: number;
  overdueTasks: number;
  reviewTasks: number;
  userCount: number;
  completionRate: number;
}

interface TaskItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  deadline: string | null;
  updatedAt: string;
  assignees: { user: { fullName: string; avatarUrl: string | null } }[];
  department: { name: string; code: string } | null;
  createdBy: { fullName: string };
}

interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  _count: { tasks: number; members: number };
  branch: { name: string };
}

interface Props {
  stats: DashboardStats;
  recentTasks: TaskItem[];
  departments: DepartmentItem[];
  role: string;
  userName: string;
}

export function DashboardContent({ stats, recentTasks, departments, role, userName }: Props) {
  const greeting = getGreeting();
  const firstName = userName.split(' ').pop() || userName;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dafa-primary">
            {greeting}, {firstName}! 👋
          </h1>
          <p className="text-dafa-muted mt-1">
            {role === 'ADMIN'
              ? 'Tổng quan hoạt động toàn công ty'
              : role === 'MANAGER'
              ? 'Tổng quan nhóm của bạn'
              : 'Tổng quan công việc của bạn'}
          </p>
        </div>
        <Link
          href="/tasks"
          className="hidden md:flex items-center gap-2 bg-dafa-accent hover:bg-dafa-accent-hover text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-[#A14F39]/20"
        >
          <ListTodo className="w-4 h-4" />
          Xem công việc
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Tổng công việc"
          value={stats.totalTasks}
          icon={<LayoutDashboard className="w-5 h-5" />}
          color="blue"
          change={null}
        />
        <StatCard
          title="Đang thực hiện"
          value={stats.inProgressTasks}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          change={null}
        />
        <StatCard
          title="Hoàn thành"
          value={stats.doneTasks}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="green"
          subtitle={`${stats.completionRate}% tỷ lệ`}
          change={null}
        />
        <StatCard
          title="Trễ hạn"
          value={stats.overdueTasks}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
          alert={stats.overdueTasks > 0}
          change={null}
        />
      </div>

      {/* Admin extra stats */}
      {role === 'ADMIN' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            title="Chờ duyệt"
            value={stats.reviewTasks}
            icon={<Eye className="w-5 h-5" />}
            color="purple"
            change={null}
          />
          <StatCard
            title="Chưa bắt đầu"
            value={stats.todoTasks}
            icon={<ListTodo className="w-5 h-5" />}
            color="slate"
            change={null}
          />
          <StatCard
            title="Nhân sự"
            value={stats.userCount}
            icon={<Users className="w-5 h-5" />}
            color="teal"
            change={null}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-dafa-border/50 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-dafa-border/50">
            <h2 className="font-semibold text-dafa-primary text-lg">Công việc gần đây</h2>
            <Link
              href="/tasks"
              className="text-sm text-dafa-accent hover:text-dafa-accent-hover font-medium flex items-center gap-1"
            >
              Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-dafa-border/30">
            {recentTasks.length === 0 ? (
              <div className="px-6 py-12 text-center text-dafa-muted">
                <ListTodo className="w-12 h-12 mx-auto mb-3 text-dafa-border" />
                <p>Chưa có công việc nào</p>
              </div>
            ) : (
              recentTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/tasks/${task.id}`}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-dafa-bg/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-dafa-text truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-dafa-muted">
                      {task.department && <span>{task.department.name}</span>}
                      {task.deadline && (
                        <>
                          <span>•</span>
                          <span>Hạn: {formatDate(task.deadline)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {task.assignees.slice(0, 3).map((a, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-dafa-accent/10 text-dafa-accent flex items-center justify-center text-xs font-semibold border-2 border-white"
                        title={a.user.fullName}
                      >
                        {getInitials(a.user.fullName)}
                      </div>
                    ))}
                    {task.assignees.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-dafa-border text-dafa-muted flex items-center justify-center text-xs font-semibold border-2 border-white">
                        +{task.assignees.length - 3}
                      </div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Completion Rate */}
          <div className="bg-white rounded-2xl border border-dafa-border/50 shadow-sm p-6">
            <h3 className="font-semibold text-dafa-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-dafa-accent" />
              Tỷ lệ hoàn thành
            </h3>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" stroke="#e5e5e5" strokeWidth="8" fill="none" />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    stroke="#A14F39"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(stats.completionRate / 100) * 339.292} 339.292`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-dafa-primary">{stats.completionRate}%</span>
                  <span className="text-xs text-dafa-muted">hoàn thành</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="text-center p-2 rounded-lg bg-green-50">
                <div className="text-lg font-bold text-green-600">{stats.doneTasks}</div>
                <div className="text-xs text-green-600/70">Xong</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-amber-50">
                <div className="text-lg font-bold text-amber-600">{stats.inProgressTasks}</div>
                <div className="text-xs text-amber-600/70">Đang làm</div>
              </div>
            </div>
          </div>

          {/* Department overview (admin) */}
          {role === 'ADMIN' && departments.length > 0 && (
            <div className="bg-white rounded-2xl border border-dafa-border/50 shadow-sm p-6">
              <h3 className="font-semibold text-dafa-primary mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-dafa-accent" />
                Phòng ban
              </h3>
              <div className="space-y-3">
                {departments.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-dafa-text">{dept.name}</p>
                      <p className="text-xs text-dafa-muted">{dept._count.members} nhân sự</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-dafa-primary">{dept._count.tasks}</p>
                      <p className="text-xs text-dafa-muted">công việc</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  alert?: boolean;
  change: number | null;
}

function StatCard({ title, value, icon, color, subtitle, alert }: StatCardProps) {
  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100' },
  };

  const c = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`bg-white rounded-2xl border ${c.border} shadow-sm p-5 transition-all duration-200 hover:shadow-md ${
        alert ? 'ring-2 ring-red-200 animate-pulse' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-dafa-primary">{value}</div>
      <div className="text-sm text-dafa-muted mt-1">{title}</div>
      {subtitle && <div className={`text-xs ${c.text} mt-1 font-medium`}>{subtitle}</div>}
    </div>
  );
}
