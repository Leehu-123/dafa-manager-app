"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function TaskForm({ initialData = null }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    departmentId: initialData?.departmentId || "",
    priority: initialData?.priority || "MEDIUM",
    status: initialData?.status || "TODO",
    deadline: initialData?.deadline ? initialData.deadline.split('T')[0] : "",
    assignees: initialData?.assignees?.map((a:any)=>a.userId) || [],
  });

  useEffect(() => {
    fetch("/api/departments").then(r => r.json()).then(setDepartments);
    fetch("/api/users").then(r => r.json()).then(setUsers);
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssigneeToggle = (userId: string) => {
    setFormData(prev => {
      const current = prev.assignees;
      if (current.includes(userId)) return { ...prev, assignees: current.filter((id: string) => id !== userId) };
      return { ...prev, assignees: [...current, userId] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = initialData ? `/api/tasks/${initialData.id}` : `/api/tasks`;
      const method = initialData ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        router.push("/tasks");
      } else {
        alert("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 dafa-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên công việc <span className="text-red-500">*</span></label>
          <Input name="title" value={formData.title} onChange={handleChange} required placeholder="Nhập tên công việc..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A14F39]"
            placeholder="Nhập mô tả..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
            <select name="departmentId" value={formData.departmentId} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none">
              <option value="">Chọn phòng ban</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hạn chót</label>
            <Input type="date" name="deadline" value={formData.deadline} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ ưu tiên</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none">
              <option value="LOW">Thấp</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HIGH">Cao</option>
              <option value="URGENT">Khẩn cấp</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none">
              <option value="TODO">Chưa bắt đầu</option>
              <option value="IN_PROGRESS">Đang thực hiện</option>
              <option value="REVIEW">Chờ duyệt</option>
              <option value="DONE">Hoàn thành</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Người thực hiện</label>
          <div className="border border-gray-200 rounded-md p-3 max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
            {users.map(u => (
              <label key={u.id} className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.assignees.includes(u.id)}
                  onChange={() => handleAssigneeToggle(u.id)}
                  className="rounded border-gray-300 text-[#A14F39] focus:ring-[#A14F39]"
                />
                <span className="text-sm">{u.fullName}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => router.back()}>Hủy bỏ</Button>
        <Button type="submit" disabled={loading} className="dafa-accent bg-[#A14F39] text-white hover:bg-[#8a3f2d]">
          {loading ? "Đang lưu..." : "Lưu công việc"}
        </Button>
      </div>
    </form>
  );
}
