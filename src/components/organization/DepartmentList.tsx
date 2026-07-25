"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Plus, Edit2, MapPin, Users } from "lucide-react";

export function DepartmentList() {
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

  const [branchForm, setBranchForm] = useState({
    id: "", name: "", code: "", city: "", address: "", isActive: true
  });
  const [deptForm, setDeptForm] = useState({
    id: "", name: "", code: "", branchId: "", description: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchRes, deptRes] = await Promise.all([
        fetch("/api/organization/branches"),
        fetch("/api/departments")
      ]);
      if (branchRes.ok) setBranches(await branchRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = branchForm.id ? `/api/organization/branches/${branchForm.id}` : "/api/organization/branches";
    const method = branchForm.id ? "PATCH" : "POST";
    
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branchForm),
      });
      if (res.ok) {
        setIsBranchModalOpen(false);
        fetchData();
      } else alert(`Lỗi: ${await res.text()}`);
    } catch (error) {
      console.error("Error saving branch", error);
    }
  };

  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = deptForm.id ? `/api/departments/${deptForm.id}` : "/api/departments";
    const method = deptForm.id ? "PATCH" : "POST";
    
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deptForm),
      });
      if (res.ok) {
        setIsDeptModalOpen(false);
        fetchData();
      } else alert(`Lỗi: ${await res.text()}`);
    } catch (error) {
      console.error("Error saving department", error);
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chi nhánh này?")) return;
    try {
      const res = await fetch(`/api/organization/branches/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
      else alert(`Lỗi: ${await res.text()}`);
    } catch (error) {
      console.error("Error deleting branch", error);
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phòng ban này?")) return;
    try {
      const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
      else alert(`Lỗi: ${await res.text()}`);
    } catch (error) {
      console.error("Error deleting department", error);
    }
  };

  const openBranchModal = (item?: any) => {
    if (item) setBranchForm({ ...item });
    else setBranchForm({ id: "", name: "", code: "", city: "", address: "", isActive: true });
    setIsBranchModalOpen(true);
  };

  const openDeptModal = (item?: any) => {
    if (item) setDeptForm({ ...item });
    else setDeptForm({ id: "", name: "", code: "", branchId: "", description: "" });
    setIsDeptModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Branches Section */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold dafa-text font-montserrat flex items-center gap-2">
            <MapPin className="w-5 h-5" /> Chi nhánh
          </h2>
          <Button onClick={() => openBranchModal()} className="bg-[#A14F39] hover:bg-[#8a3f2d] text-white">
            <Plus className="w-4 h-4 mr-2" /> Thêm Chi nhánh
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map(branch => (
            <Card key={branch.id} className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg dafa-text">{branch.name}</h3>
                  <p className="text-xs dafa-muted">{branch.code}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openBranchModal(branch)}>
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteBranch(branch.id)}>
                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
              <div className="text-sm dafa-muted">
                <p>📍 {branch.city} - {branch.address}</p>
                <div className="mt-2">
                  <Badge variant={branch.isActive ? "outline" : "secondary"}>
                    {branch.isActive ? "Đang hoạt động" : "Tạm ngừng"}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
          {branches.length === 0 && <div className="col-span-full text-center p-8 dafa-muted border border-dashed rounded-md">Chưa có chi nhánh nào</div>}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Departments Section */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold dafa-text font-montserrat flex items-center gap-2">
            <Users className="w-5 h-5" /> Phòng ban
          </h2>
          <Button onClick={() => openDeptModal()} className="bg-gray-800 hover:bg-gray-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Thêm Phòng ban
          </Button>
        </div>
        
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dafa-muted border-b dafa-border uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Phòng ban</th>
                  <th className="px-6 py-3">Mã</th>
                  <th className="px-6 py-3">Chi nhánh</th>
                  <th className="px-6 py-3">Mô tả</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.id} className="border-b dafa-border bg-white hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold dafa-text">{dept.name}</td>
                    <td className="px-6 py-4 dafa-muted">{dept.code}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">{dept.branchName || branches.find(b => b.id === dept.branchId)?.name || 'N/A'}</Badge>
                    </td>
                    <td className="px-6 py-4 dafa-muted">{dept.description || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openDeptModal(dept)}>
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteDept(dept.id)}>
                          <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {departments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center dafa-muted border-dashed border-t">Chưa có phòng ban nào</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Branch Modal */}
      <Modal isOpen={isBranchModalOpen} onClose={() => setIsBranchModalOpen(false)} title={branchForm.id ? "Cập nhật chi nhánh" : "Thêm chi nhánh mới"}>
        <form onSubmit={handleBranchSubmit} className="flex flex-col gap-4 p-4">
          <Input label="Tên chi nhánh" required value={branchForm.name} onChange={(e) => setBranchForm({...branchForm, name: e.target.value})} />
          <Input label="Mã chi nhánh" required value={branchForm.code} onChange={(e) => setBranchForm({...branchForm, code: e.target.value})} />
          <Input label="Tỉnh/Thành phố" required value={branchForm.city} onChange={(e) => setBranchForm({...branchForm, city: e.target.value})} />
          <Input label="Địa chỉ chi tiết" value={branchForm.address} onChange={(e) => setBranchForm({...branchForm, address: e.target.value})} />
          
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="branchActive" checked={branchForm.isActive} onChange={(e) => setBranchForm({...branchForm, isActive: e.target.checked})} className="rounded text-[#A14F39]" />
            <label htmlFor="branchActive" className="text-sm font-medium dafa-text cursor-pointer">Đang hoạt động</label>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setIsBranchModalOpen(false)}>Hủy</Button>
            <Button type="submit" className="bg-[#A14F39] text-white hover:bg-[#8a3f2d]">Lưu</Button>
          </div>
        </form>
      </Modal>

      {/* Department Modal */}
      <Modal isOpen={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)} title={deptForm.id ? "Cập nhật phòng ban" : "Thêm phòng ban mới"}>
        <form onSubmit={handleDeptSubmit} className="flex flex-col gap-4 p-4">
          <Input label="Tên phòng ban" required value={deptForm.name} onChange={(e) => setDeptForm({...deptForm, name: e.target.value})} />
          <Input label="Mã phòng ban" required value={deptForm.code} onChange={(e) => setDeptForm({...deptForm, code: e.target.value})} />
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium dafa-text">Chi nhánh trực thuộc</label>
            <select required className="border dafa-border rounded-md px-3 py-2 text-sm bg-white" value={deptForm.branchId} onChange={(e) => setDeptForm({...deptForm, branchId: e.target.value})}>
              <option value="">Chọn chi nhánh</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <Input label="Mô tả" value={deptForm.description} onChange={(e) => setDeptForm({...deptForm, description: e.target.value})} />

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeptModalOpen(false)}>Hủy</Button>
            <Button type="submit" className="bg-gray-800 text-white hover:bg-gray-700">Lưu</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
