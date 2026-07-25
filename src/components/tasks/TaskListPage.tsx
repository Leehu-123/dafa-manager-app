"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Search, Plus, LayoutList, LayoutGrid, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatDate, getStatusLabel, getStatusColor, getPriorityLabel, getPriorityColor, getInitials } from "@/lib/utils";

export default function TaskListPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
        ...(departmentFilter && { departmentId: departmentFilter }),
      });
      const res = await fetch(`/api/tasks?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, statusFilter, priorityFilter, departmentFilter]);

  useEffect(() => {
    fetch("/api/departments").then(r => r.json()).then(setDepartments);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTasks();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold dafa-text">Danh sách Công việc</h1>
        <Button onClick={() => router.push("/tasks/new")} className="dafa-accent bg-[#A14F39] text-white hover:bg-[#8a3f2d]">
          <Plus className="w-4 h-4 mr-2" /> Thêm công việc
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 dafa-bg dafa-border rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 dafa-muted" />
            <Input 
              type="text"
              placeholder="Tìm kiếm công việc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Button type="submit" variant="outline">Tìm kiếm</Button>
        </form>

        <div className="flex gap-2 items-center">
          <select 
            className="dafa-border rounded-md px-3 py-2 text-sm focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="TODO">Chưa bắt đầu</option>
            <option value="IN_PROGRESS">Đang thực hiện</option>
            <option value="REVIEW">Chờ duyệt</option>
            <option value="DONE">Hoàn thành</option>
            <option value="OVERDUE">Quá hạn</option>
          </select>
          
          <select 
            className="dafa-border rounded-md px-3 py-2 text-sm focus:outline-none"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          
          <select 
            className="dafa-border rounded-md px-3 py-2 text-sm focus:outline-none"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">Tất cả mức độ</option>
            <option value="LOW">Thấp</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="HIGH">Cao</option>
            <option value="URGENT">Khẩn cấp</option>
          </select>

          <div className="flex border border-gray-200 rounded-md overflow-hidden">
            <Button variant="ghost" className="rounded-none px-2 bg-gray-100" onClick={() => router.push("/tasks")}>
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="rounded-none px-2 hover:bg-gray-100" onClick={() => router.push("/tasks/kanban")}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="dafa-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs dafa-muted bg-gray-50 uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Công việc</th>
                <th className="px-6 py-3 font-medium">Trạng thái</th>
                <th className="px-6 py-3 font-medium">Mức độ</th>
                <th className="px-6 py-3 font-medium">Người thực hiện</th>
                <th className="px-6 py-3 font-medium">Phòng ban</th>
                <th className="px-6 py-3 font-medium">Hạn chót</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Đang tải...</td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Không tìm thấy công việc nào.</td></tr>
              ) : (
                tasks.map((task) => (
                  <tr 
                    key={task.id} 
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/tasks/${task.id}`)}
                  >
                    <td className="px-6 py-4 font-medium dafa-text">{task.title}</td>
                    <td className="px-6 py-4">
                      <Badge className={cn("text-white", getStatusColor(task.status))}>
                        {getStatusLabel(task.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={cn("border", getPriorityColor(task.priority).replace('bg-', 'text-').replace('500', '600'))}>
                        {getPriorityLabel(task.priority)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {task.assignees.slice(0, 3).map((a: any) => (
                          <Avatar key={a.id} src={a.user.avatarUrl} fallback={getInitials(a.user.fullName)} className="w-8 h-8 border-2 border-white" />
                        ))}
                        {task.assignees.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs border-2 border-white z-10">
                            +{task.assignees.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 dafa-muted">{task.department?.name || "-"}</td>
                    <td className="px-6 py-4 dafa-muted">{task.deadline ? formatDate(task.deadline) : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm dafa-muted">Trang {page} / {totalPages}</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
