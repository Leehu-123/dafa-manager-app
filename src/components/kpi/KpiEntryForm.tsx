"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Save } from "lucide-react";

export function KpiEntryForm({ currentUser }: { currentUser: any }) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [criteria, setCriteria] = useState<any[]>([]);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [actuals, setActuals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await fetch("/api/organization/employees");
      if (res.ok) {
        setEmployees(await res.json());
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchCriteria = async () => {
      if (!selectedEmp) {
        setCriteria([]);
        return;
      }
      const emp = employees.find(e => e.id === selectedEmp);
      if (emp && emp.departments.length > 0) {
        const deptId = emp.departments[0].departmentId;
        const res = await fetch(`/api/kpi/criteria?departmentId=${deptId}`);
        if (res.ok) {
          setCriteria(await res.json());
        }
      }
    };
    fetchCriteria();
  }, [selectedEmp, employees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || !periodStart || !periodEnd) return alert("Vui lòng điền đủ thông tin kỳ đánh giá");
    
    setLoading(true);
    try {
      for (const crit of criteria) {
        const actual = actuals[crit.id] || 0;
        await fetch("/api/kpi/records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: selectedEmp,
            criteriaId: crit.id,
            periodStart,
            periodEnd,
            actual,
            note: ""
          })
        });
      }
      alert("Đã lưu dữ liệu KPI thành công!");
    } catch (error) {
      console.error("Error saving KPI records", error);
      alert("Có lỗi xảy ra khi lưu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium dafa-text">Nhân viên</label>
            <select required className="border dafa-border rounded-md px-3 py-2 text-sm bg-white" value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)}>
              <option value="">-- Chọn nhân viên --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} - {emp.jobTitle}</option>
              ))}
            </select>
          </div>
          <Input label="Ngày bắt đầu kỳ" type="date" required value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
          <Input label="Ngày kết thúc kỳ" type="date" required value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
        </div>

        {selectedEmp && criteria.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold dafa-text mb-4 text-lg border-b pb-2">Danh sách tiêu chí đánh giá</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dafa-muted border-b dafa-border text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Tiêu chí</th>
                    <th className="px-4 py-3">Đơn vị</th>
                    <th className="px-4 py-3 text-right">Mục tiêu</th>
                    <th className="px-4 py-3 text-right">Trọng số</th>
                    <th className="px-4 py-3 w-40 text-center">Thực tế đạt được</th>
                    <th className="px-4 py-3 text-right">Điểm ước tính</th>
                  </tr>
                </thead>
                <tbody>
                  {criteria.map((crit) => {
                    const act = actuals[crit.id] || 0;
                    const estScore = (act / crit.target) * crit.weight;
                    return (
                      <tr key={crit.id} className="border-b dafa-border hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium dafa-text">{crit.name}</td>
                        <td className="px-4 py-3 dafa-muted">{crit.unit}</td>
                        <td className="px-4 py-3 text-right font-medium">{crit.target}</td>
                        <td className="px-4 py-3 text-right">{crit.weight}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full border dafa-border rounded-md px-3 py-1.5 text-sm text-center"
                            value={actuals[crit.id] || ""}
                            onChange={(e) => setActuals({...actuals, [crit.id]: Number(e.target.value)})}
                            required
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-[#A14F39]">{estScore.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end">
              <Button type="submit" disabled={loading} className="bg-[#A14F39] hover:bg-[#8a3f2d] text-white">
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Đang lưu..." : "Lưu Kết Quả"}
              </Button>
            </div>
          </div>
        )}
        
        {selectedEmp && criteria.length === 0 && (
          <div className="text-center p-8 dafa-muted bg-gray-50 rounded-lg border border-dashed border-gray-300">
            Không tìm thấy tiêu chí KPI nào cho phòng ban của nhân viên này.
          </div>
        )}
      </form>
    </Card>
  );
}
