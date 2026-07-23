import { clsx, type ClassValue } from 'clsx';
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '';
  const d = new Date(date);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return '';
  const d = new Date(date);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    TODO: 'Cần làm',
    IN_PROGRESS: 'Đang làm',
    REVIEW: 'Chờ duyệt',
    DONE: 'Hoàn thành',
    OVERDUE: 'Quá hạn',
  };
  return labels[status.toUpperCase()] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    TODO: 'bg-status-todo/10 text-status-todo border-status-todo/20',
    IN_PROGRESS: 'bg-status-in-progress/10 text-status-in-progress border-status-in-progress/20',
    REVIEW: 'bg-status-review/10 text-status-review border-status-review/20',
    DONE: 'bg-status-done/10 text-status-done border-status-done/20',
    OVERDUE: 'bg-status-overdue/10 text-status-overdue border-status-overdue/20',
  };
  return colors[status.toUpperCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    LOW: 'Thấp',
    MEDIUM: 'Trung bình',
    HIGH: 'Cao',
    URGENT: 'Khẩn cấp',
  };
  return labels[priority.toUpperCase()] || priority;
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: 'text-priority-low',
    MEDIUM: 'text-priority-medium',
    HIGH: 'text-priority-high',
    URGENT: 'text-priority-urgent',
  };
  return colors[priority.toUpperCase()] || 'text-gray-500';
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: 'Quản trị viên',
    MANAGER: 'Quản lý',
    EMPLOYEE: 'Nhân viên',
  };
  return labels[role.toUpperCase()] || role;
}

export function getInitials(name: string): string {
  if (!name) return 'UN';
  return name
    .split(' ')
    .filter(part => part.length > 0)
    .map(part => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export function calculateKpiScore(actual: number, target: number, weight: number): number {
  if (target === 0) return 0;
  return (actual / target) * weight;
}

export function getKpiRating(score: number): string {
  if (score >= 100) return 'Xuất sắc';
  if (score >= 80) return 'Tốt';
  if (score >= 50) return 'Đạt';
  return 'Chưa đạt';
}

export function getKpiRatingColor(score: number): string {
  if (score >= 100) return 'text-status-done';
  if (score >= 80) return 'text-status-in-progress';
  if (score >= 50) return 'text-status-review';
  return 'text-status-overdue';
}
