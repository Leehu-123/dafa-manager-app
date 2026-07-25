"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Plus, Edit2, Trash2 } from "lucide-react";

export function KpiCriteriaManager() {
  const [criteria, setCriteria] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedCycle, setSelectedCycle] = useState("ALL");
  const [selectedEmpFilter, setSelectedEmpFilter] = useState("");
  const [formData, setFormData] = useState({
    id: "", name: "", description: "", unit: "", target: 0, weight: 0, cycle: "MONTHLY", comparisonType: "HIGHER_BETTER", departmentId: "", userId: "", isActive: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [critRes, deptRes, empRes] = await Promise.all([
        fetch(`/api/kpi/criteria${selectedDept ? `?departmentId=${selectedDept}` : ''}`),
        fetch("/api/departments"),
        fetch("/api/organization/employees")
      ]);
      
      if (critRes.ok) setCriteria(await critRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
      if (empRes.ok) setEmployees(await empRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDept]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = formData.id ? `/api/kpi/criteria/${formData.id}` : "/api/kpi/criteria";
    const method = formData.id ? "PATCH" : "POST";
    
    try {
      const payload = {
        departmentId: formData.departmentId,
        userId: formData.userId || null,
        name: formData.name,
        description: formData.description,
        unit: formData.unit,
        targetValue: formData.target,
        weightPercent: formData.weight,
        evaluationCycle: formData.cycle,
        comparisonType: formData.comparisonType,
        isActive: formData.isActive
      };
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error saving criteria", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tiêu chí này?")) return;
    try {
      const res = await fetch(`/api/kpi/criteria/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error deleting criteria", error);
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setFormData({
        id: item.id,
        name: item.name,
        description: item.description || "",
        unit: item.unit,
        target: item.targetValue,
        weight: item.weightPercent,
        cycle: item.evaluationCycle,
        comparisonType: item.comparisonType || "HIGHER_BETTER",
        departmentId: item.departmentId,
        userId: item.userId || "",
        isActive: item.isActive
      });
    } else {
      setFormData({ id: "", name: "", description: "", unit: "", target: 0, weight: 0, cycle: "MONTHLY", comparisonType: "HIGHER_BETTER", departmentId: "", userId: "", isActive: true });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <select 
            className="border dafa-border rounded-md px-3 py-2 text-sm bg-white"
            value={selectedDept}
            onChange={(e) => { setSelectedDept(e.target.value); setSelectedEmpFilter(""); }}
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select 
            className="border dafa-border rounded-md px-3 py-2 text-sm bg-white"
            value={selectedEmpFilter}
            onChange={(e) => setSelectedEmpFilter(e.target.value)}
          >
            <option value="">Tất cả nhân viên</option>
            <option value="GENERAL">Tiêu chí chung (Không gán cá nhân)</option>
            {employees
              .filter(emp => !selectedDept || emp.departmentMember?.some((dm: any) => dm.departmentId === selectedDept))
              .map(emp => (
              <option key={emp.id} value={emp.id}>{emp.fullName}</option>
            ))}
          </select>

          <select 
            className="border dafa-border rounded-md px-3 py-2 text-sm bg-white"
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
          >
            <option value="ALL">Tất cả chu kỳ</option>
            <option value="WEEKLY">Hàng tuần</option>
            <option value="MONTHLY">Hàng tháng</option>
            <option value="QUARTERLY">Hàng quý</option>
          </select>
        </div>
        
        <Button onClick={() => openModal()} className="bg-[#A14F39] hover:bg-[#8a3f2d] text-white">
          <Plus className="w-4 h-4 mr-2" /> Thêm Tiêu Chí
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dafa-muted border-b dafa-border uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Tên tiêu chí</th>
                <th className="px-6 py-3">Phòng ban</th>
                <th className="px-6 py-3 text-right">Mục tiêu</th>
                <th className="px-6 py-3">Đơn vị</th>
                <th className="px-6 py-3 text-right">Trọng số</th>
                <th className="px-6 py-3">Chu kỳ</th>
                <th className="px-6 py-3 text-center">Trạng thái</th>
                <th className="px-6 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {criteria
                .filter(item => selectedCycle === "ALL" || item.evaluationCycle === selectedCycle)
                .filter(item => {
                  if (selectedEmpFilter === "GENERAL") return item.userId === null;
                  if (selectedEmpFilter) return item.userId === selectedEmpFilter || item.userId === null;
                  return true;
                })
                .map((item) => (
                <tr key={item.id} className="border-b dafa-border bg-white hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium dafa-text">
                    {item.name}
                    {item.user && (
                      <span className="ml-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {item.user.fullName}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 dafa-muted">{item.department?.name}</td>
                  <td className="px-6 py-4 text-right font-medium">{item.targetValue}</td>
                  <td className="px-6 py-4 dafa-muted">{item.unit}</td>
                  <td className="px-6 py-4 text-right">{item.weightPercent}</td>
                  <td className="px-6 py-4 dafa-muted">{item.evaluationCycle === "MONTHLY" ? "Hàng tháng" : item.evaluationCycle === "WEEKLY" ? "Hàng tuần" : "Hàng quý"}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant={item.isActive ? "default" : "secondary"} className={item.isActive ? "bg-green-100 text-green-800" : ""}>
                      {item.isActive ? "Hoạt động" : "Tạm khóa"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openModal(item)}>
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Cập nhật tiêu chí" : "Thêm tiêu chí mới"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
          <Input label="Tên tiêu chí" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <Input label="Mô tả" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Mục tiêu" type="number" required value={formData.target} onChange={(e) => setFormData({...formData, target: Number(e.target.value)})} />
            <Input label="Đơn vị tính" required value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} />
            <Input label="Trọng số" type="number" required value={formData.weight} onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium dafa-text">Chu kỳ</label>
              <select className="border dafa-border rounded-md px-3 py-2 text-sm bg-white" value={formData.cycle} onChange={(e) => setFormData({...formData, cycle: e.target.value})}>
                <option value="WEEKLY">Hàng tuần</option>
                <option value="MONTHLY">Hàng tháng</option>
                <option value="QUARTERLY">Hàng quý</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium dafa-text">Loại tiêu chí</label>
              <select className="border dafa-border rounded-md px-3 py-2 text-sm bg-white" value={formData.comparisonType} onChange={(e) => setFormData({...formData, comparisonType: e.target.value})}>
                <option value="HIGHER_BETTER">Càng cao càng tốt</option>
                <option value="LOWER_BETTER">Càng thấp càng tốt</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium dafa-text">Phòng ban</label>
              <select required className="border dafa-border rounded-md px-3 py-2 text-sm bg-white" value={formData.departmentId} onChange={(e) => setFormData({...formData, departmentId: e.target.value, userId: ""})}>
                <option value="">Chọn phòng ban</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium dafa-text">Áp dụng cho (Tuỳ chọn)</label>
              <select className="border dafa-border rounded-md px-3 py-2 text-sm bg-white" value={formData.userId} onChange={(e) => setFormData({...formData, userId: e.target.value})}>
                <option value="">Tất cả nhân viên trong phòng</option>
                {employees
                  .filter(emp => !formData.departmentId || emp.departmentMember?.some((dm: any) => dm.departmentId === formData.departmentId))
                  .map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" className="bg-[#A14F39] text-white hover:bg-[#8a3f2d]">Lưu lại</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
