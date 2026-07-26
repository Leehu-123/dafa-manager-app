"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Plus, Edit2, Search } from "lucide-react";
import { getRoleLabel } from "@/lib/utils";

export function EmployeeList() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterBranch, setFilterBranch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: "", name: "", email: "", password: "", phone: "", role: "EMPLOYEE", jobTitle: "", branchId: "", departmentIds: [] as string[], isActive: true
  });

  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      let empUrl = "/api/organization/employees?";
      if (filterBranch) empUrl += `branchId=${filterBranch}&`;
      if (filterStatus) empUrl += `status=${filterStatus}`;
      
      const [empRes, branchRes, deptRes] = await Promise.all([
        fetch(empUrl),
        fetch("/api/organization/branches"),
        fetch("/api/departments")
      ]);
      
      if (empRes.status === 401 || branchRes.status === 401 || deptRes.status === 401) {
        setError("SESSION_EXPIRED");
      } else {
        if (empRes.ok) setEmployees(await empRes.json());
        else setError(`Lỗi API Employee (${empRes.status}): ${await empRes.text()}`);
        if (branchRes.ok) setBranches(await branchRes.json());
        if (deptRes.ok) setDepartments(await deptRes.json());
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(`Lỗi kết nối: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterBranch, filterStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = formData.id ? `/api/organization/employees/${formData.id}` : "/api/organization/employees";
    const method = formData.id ? "PATCH" : "POST";
    
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const err = await res.text();
        alert(`Lỗi: ${err}`);
      }
    } catch (error) {
      console.error("Error saving employee", error);
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setFormData({ 
        id: item.id, name: item.fullName || item.name, email: item.email, password: "", phone: item.phone || "", role: item.role, 
        jobTitle: item.jobTitle || "", branchId: item.primaryBranchId || item.branchId || "", 
        departmentIds: (item.departmentMember || item.departments || []).map((d: any) => d.departmentId), isActive: item.isActive 
      });
    } else {
      setFormData({ 
        id: "", name: "", email: "", password: "", phone: "", role: "EMPLOYEE", jobTitle: "", branchId: "", departmentIds: [], isActive: true 
      });
    }
    setIsModalOpen(true);
  };

  const handleDeptToggle = (deptId: string) => {
    setFormData(prev => {
      const ids = [...prev.departmentIds];
      if (ids.includes(deptId)) return { ...prev, departmentIds: ids.filter(id => id !== deptId) };
      return { ...prev, departmentIds: [...ids, deptId] };
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2">
          <select className="border dafa-border rounded-md px-3 py-2 text-sm bg-white" value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
            <option value="">Tất cả chi nhánh</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select className="border dafa-border rounded-md px-3 py-2 text-sm bg-white" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang làm việc</option>
            <option value="false">Đã nghỉ</option>
          </select>
        </div>
        
        <Button onClick={() => openModal()} className="bg-[#A14F39] hover:bg-[#8a3f2d] text-white">
          <Plus className="w-4 h-4 mr-2" /> Thêm Nhân Viên
        </Button>
      </div>

      {error === "SESSION_EXPIRED" ? (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm flex items-center justify-between">
          <span>Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.</span>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/login'}>Đăng nhập lại</Button>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => fetchData()}>Thử lại</Button>
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dafa-muted border-b dafa-border uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Nhân viên</th>
                <th className="px-6 py-3">Vai trò</th>
                <th className="px-6 py-3">Chức danh</th>
                <th className="px-6 py-3">Phòng ban</th>
                <th className="px-6 py-3">Chi nhánh</th>
                <th className="px-6 py-3 text-center">Trạng thái</th>
                <th className="px-6 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b dafa-border bg-white hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold dafa-text">{emp.fullName || emp.name}</span>
                      <span className="text-xs dafa-muted">{emp.email}</span>
                      <span className="text-xs dafa-muted">{emp.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={emp.role === "ADMIN" ? "destructive" : emp.role === "MANAGER" ? "default" : "secondary"}>
                      {getRoleLabel(emp.role)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 dafa-muted">{emp.jobTitle || "-"}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(emp.departmentMember || emp.departments || []).map((d: any) => (
                        <Badge key={d.id} variant="outline" className="text-[10px]">{d.department?.name || 'N/A'}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 dafa-muted">{emp.primaryBranch?.name || emp.branch?.name || "-"}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant={emp.isActive ? "outline" : "secondary"} className={emp.isActive ? "border-green-500 text-green-700 bg-green-50" : ""}>
                      {emp.isActive ? "Đang làm việc" : "Đã nghỉ"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openModal(emp)}>
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </Button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center dafa-muted">Không tìm thấy nhân viên nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Cập nhật nhân viên" : "Thêm nhân viên mới"} className="max-w-3xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Họ và tên" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <Input label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <Input label="Số điện thoại" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            <Input label={formData.id ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"} type="password" required={!formData.id} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium dafa-text">Vai trò hệ thống</label>
              <select className="border dafa-border rounded-md px-3 py-2 text-sm bg-white" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                <option value="EMPLOYEE">Nhân viên</option>
                <option value="MANAGER">Quản lý</option>
                <option value="ACCOUNTANT">Kế toán / HCNS</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
            </div>
            
            <Input label="Chức danh công việc" value={formData.jobTitle} onChange={(e) => setFormData({...formData, jobTitle: e.target.value})} />
            
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium dafa-text">Chi nhánh</label>
              <select className="border dafa-border rounded-md px-3 py-2 text-sm bg-white" value={formData.branchId || ""} onChange={(e) => setFormData({...formData, branchId: e.target.value})}>
                <option value="">Ban Lãnh Đạo (Toàn công ty)</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            
            {formData.id && (
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="rounded text-[#A14F39]" />
                  <span className="text-sm font-medium dafa-text">Đang làm việc (Kích hoạt tài khoản)</span>
                </label>
              </div>
            )}
          </div>

          <div className="border-t dafa-border pt-4 mt-2">
            <label className="text-sm font-medium dafa-text block mb-2">Phòng ban trực thuộc</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {departments.filter(d => !formData.branchId || d.branchId === formData.branchId).map(dept => (
                <label key={dept.id} className="flex items-center gap-2 p-2 border dafa-border rounded-md bg-gray-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.departmentIds.includes(dept.id)}
                    onChange={() => handleDeptToggle(dept.id)}
                    className="rounded text-[#A14F39]"
                  />
                  <span className="text-sm dafa-text">{dept.name}</span>
                </label>
              ))}
              {departments.filter(d => !formData.branchId || d.branchId === formData.branchId).length === 0 && (
                <span className="text-sm dafa-muted italic col-span-full">Vui lòng chọn chi nhánh trước hoặc chi nhánh này chưa có phòng ban.</span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" className="bg-[#A14F39] text-white hover:bg-[#8a3f2d]">Lưu thông tin</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
