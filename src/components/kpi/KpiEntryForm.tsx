"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Save } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { calculateKpiScore } from "@/lib/utils";

export function KpiEntryForm({ currentUser }: { currentUser: any }) {
  const searchParams = useSearchParams();
  const paramUserId = searchParams.get("userId");
  const paramPeriodStart = searchParams.get("periodStart");
  const paramPeriodEnd = searchParams.get("periodEnd");

  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState(paramUserId || "");
  const [criteria, setCriteria] = useState<any[]>([]);
  const [periodStart, setPeriodStart] = useState(paramPeriodStart || "");
  const [periodEnd, setPeriodEnd] = useState(paramPeriodEnd || "");
  const [actuals, setActuals] = useState<Record<string, string | number>>({});
  const [loading, setLoading] = useState(false);

  const userRoleStr = (currentUser?.role || (Array.isArray(currentUser?.roles) ? currentUser.roles[0] : '') || '').toUpperCase();
  const isAdmin = ["ADMIN", "OWNER"].includes(userRoleStr);
  const isFullDeptAccess = ["ADMIN", "OWNER", "ACCOUNTANT"].includes(userRoleStr);
  const managerDeptIds = currentUser?.departmentMember?.map((dm: any) => dm.departmentId) || [];

  const visibleDepartments = isFullDeptAccess
    ? departments
    : departments.filter((d) => managerDeptIds.includes(d.id));

  useEffect(() => {
    if (!isFullDeptAccess && managerDeptIds.length > 0 && !selectedDept) {
      setSelectedDept(managerDeptIds[0]);
    }
  }, [isFullDeptAccess, managerDeptIds, departments]);

  useEffect(() => {
    if (paramUserId) setSelectedEmp(paramUserId);
    if (paramPeriodStart) setPeriodStart(paramPeriodStart);
    if (paramPeriodEnd) setPeriodEnd(paramPeriodEnd);
  }, [paramUserId, paramPeriodStart, paramPeriodEnd]);

  useEffect(() => {
    const fetchDepartments = async () => {
      const res = await fetch("/api/departments");
      if (res.ok) setDepartments(await res.json());
    };
    const fetchEmployees = async () => {
      const res = await fetch("/api/organization/employees");
      if (res.ok) {
        setEmployees(await res.json());
      }
    };
    fetchDepartments();
    fetchEmployees();
  }, []);

  // Logic lọc nhân viên được quyền chấm KPI
  const getFilterableEmployees = () => {
    const activeDept = isFullDeptAccess ? selectedDept : (selectedDept || managerDeptIds[0]);
    let list = employees;
    if (activeDept) {
      list = list.filter((emp) =>
        emp.departmentMember?.some((dm: any) => dm.departmentId === activeDept)
      );
    }

    if (isAdmin) return list;

    const currentUserId = currentUser?.id || currentUser?.sub;

    if (userRoleStr === "MANAGER") {
      return list.filter((emp) => {
        const inManagerDept = emp.departmentMember?.some((dm: any) =>
          managerDeptIds.includes(dm.departmentId)
        );
        return inManagerDept && emp.id !== currentUserId;
      });
    }

    if (userRoleStr === "ACCOUNTANT") {
      return list.filter((emp) => {
        const empDepts = emp.departmentMember?.map((dm: any) => dm.departmentId) || [];
        if (empDepts.length === 0) return true;

        const empRole = (emp.role || (Array.isArray(emp.roles) ? emp.roles[0] : '') || '').toUpperCase();
        const isEmpManager = empRole === "MANAGER" || emp.departmentMember?.some((dm: any) => dm.isHead === true);

        const deptHasManager = empDepts.some((deptId) => {
          return employees.some((otherEmp) => {
            if (otherEmp.id === emp.id) return false;
            const otherRole = (otherEmp.role || (Array.isArray(otherEmp.roles) ? otherEmp.roles[0] : '') || '').toUpperCase();
            const isOtherManager = otherRole === "MANAGER" || otherEmp.departmentMember?.some((dm: any) => dm.departmentId === deptId && dm.isHead === true);
            return isOtherManager;
          });
        });

        if (deptHasManager) {
          return isEmpManager;
        } else {
          return true;
        }
      });
    }

    return list;
  };

  const filteredEmployees = getFilterableEmployees();

  useEffect(() => {
    const fetchCriteria = async () => {
      if (!selectedEmp) {
        setCriteria([]);
        return;
      }
      const emp = employees.find(e => e.id === selectedEmp);
      if (emp && emp.departmentMember && emp.departmentMember.length > 0) {
        const deptId = emp.departmentMember[0].departmentId;
        const res = await fetch(`/api/kpi/criteria?departmentId=${deptId}&userId=${emp.id}`);
        if (res.ok) {
          setCriteria(await res.json());
        }
      }
    };
    fetchCriteria();
  }, [selectedEmp, employees]);

  const [status, setStatus] = useState<string>("DRAFT");

  useEffect(() => {
    const fetchExistingRecords = async () => {
      if (!selectedEmp || !periodStart || !periodEnd) return;
      
      const res = await fetch(`/api/kpi/records?userId=${selectedEmp}&periodStart=${periodStart}&periodEnd=${periodEnd}`);
      if (res.ok) {
        const data = await res.json();
        const existingActuals: Record<string, string | number> = {};
        let currentStatus = "DRAFT";
        data.forEach((r: any) => {
          existingActuals[r.criteriaId] = r.actualValue;
          if (r.status === "APPROVED") currentStatus = "APPROVED";
        });
        setActuals(existingActuals);
        setStatus(currentStatus);
      }
    };
    fetchExistingRecords();
  }, [selectedEmp, periodStart, periodEnd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || !periodStart || !periodEnd) return alert("Vui lòng điền đủ thông tin kỳ đánh giá");
    
    setLoading(true);
    try {
      const recordsToSave = criteria.map((crit) => {
        const actual = parseFloat(actuals[crit.id] as string) || 0;
        const score = calculateKpiScore(actual, crit.targetValue || 0, crit.weightPercent || 0, crit.comparisonType, crit.unit);
        return {
          criteriaId: crit.id,
          actual,
          score,
          note: "",
        };
      });

      const res = await fetch("/api/kpi/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedEmp,
          periodStart,
          periodEnd,
          records: recordsToSave,
        }),
      });

      if (res.ok) {
        alert("Đã lưu dữ liệu KPI thành công!");
      } else {
        alert("Có lỗi xảy ra khi lưu dữ liệu KPI");
      }
    } catch (error) {
      console.error("Error saving KPI records", error);
      alert("Có lỗi xảy ra khi lưu");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (action: "APPROVE" | "UNLOCK") => {
    if (!isAdmin) return alert("Chỉ tài khoản quản trị mới có quyền phê duyệt phiếu KPI");
    if (!selectedEmp || !periodStart || !periodEnd) return alert("Vui lòng điền đủ thông tin kỳ đánh giá");
    
    setLoading(true);
    try {
      const res = await fetch("/api/kpi/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedEmp,
          periodStart,
          periodEnd,
          action
        })
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.newStatus);
        alert(action === "APPROVE" ? "Đã phê duyệt KPI thành công!" : "Đã mở khóa KPI!");
      } else {
        const err = await res.text();
        alert(`Lỗi: ${err}`);
      }
    } catch (error) {
      console.error("Error approving KPI", error);
      alert("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalScore = () => {
    return criteria.reduce((sum, crit) => {
      const rawAct = actuals[crit.id];
      if (rawAct === undefined || rawAct === "") return sum;
      const act = parseFloat(rawAct as string);
      if (isNaN(act)) return sum;
      
      const score = calculateKpiScore(act, crit.targetValue || 0, crit.weightPercent || 0, crit.comparisonType, crit.unit);
      return sum + score;
    }, 0);
  };

  const totalScore = calculateTotalScore();
  const maxPossibleScore = criteria.reduce((sum, crit) => sum + (crit.weightPercent || 0), 0);

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium dafa-text">Phòng ban</label>
            <select className="border dafa-border rounded-md px-3 py-2 text-sm bg-white min-w-[180px]" value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setSelectedEmp(""); }}>
              {isFullDeptAccess && <option value="">Tất cả phòng ban</option>}
              {visibleDepartments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium dafa-text">Nhân viên</label>
            <select required className="border dafa-border rounded-md px-3 py-2 text-sm bg-white" value={selectedEmp} onChange={(e) => setSelectedEmp(e.target.value)}>
              <option value="">-- Chọn nhân viên --</option>
              {filteredEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.fullName} - {emp.jobTitle}</option>
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
                    const rawAct = actuals[crit.id];
                    let estScore = 0;
                    let actNum = NaN;
                    if (rawAct !== undefined && rawAct !== "") {
                      actNum = parseFloat(rawAct as string);
                      if (!isNaN(actNum)) {
                        estScore = calculateKpiScore(actNum, crit.targetValue || 0, crit.weightPercent || 0, crit.comparisonType, crit.unit);
                      }
                    }
                    return (
                      <tr key={crit.id} className="border-b dafa-border hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium dafa-text">{crit.name}</td>
                        <td className="px-4 py-3 dafa-muted">{crit.unit}</td>
                        <td className="px-4 py-3 text-right font-medium">{crit.targetValue}</td>
                        <td className="px-4 py-3 text-right">{crit.weightPercent}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="any"
                            className="border dafa-border rounded px-2 py-1 w-full bg-white disabled:bg-gray-100 disabled:text-gray-500"
                            value={actuals[crit.id] ?? ""}
                            onChange={(e) => setActuals({...actuals, [crit.id]: e.target.value})}
                            disabled={status === "APPROVED" && currentUser.role !== "ADMIN"}
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-[#A14F39]">
                          {!isNaN(actNum) ? estScore.toFixed(2) : "NaN"}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 dafa-border bg-gray-50">
                    <td colSpan={4} className="px-4 py-4 text-right font-bold dafa-text">
                      Trạng thái: 
                      <span className={`ml-2 px-2 py-1 rounded text-xs text-white ${status === "APPROVED" ? "bg-green-600" : "bg-gray-500"}`}>
                        {status === "APPROVED" ? "Đã Phê Duyệt" : "Đang Chấm"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-bold dafa-text">Tổng điểm ước tính:</td>
                    <td className="px-4 py-4 text-right font-bold text-xl text-[#A14F39]">
                      {totalScore.toFixed(2)} / {maxPossibleScore}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-between items-center">
              <div>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    if (!selectedEmp) {
                      alert("Vui lòng chọn nhân viên trước khi in biên bản!");
                      return;
                    }
                    window.open(`/print/kpi?userId=${selectedEmp}&periodStart=${periodStart}&periodEnd=${periodEnd}`, '_blank');
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  In Biên Bản (Mẫu Trống)
                </Button>
              </div>
              <div className="flex gap-3">
                {status === "APPROVED" && currentUser.role === "ADMIN" && (
                  <Button type="button" onClick={() => handleApprove("UNLOCK")} disabled={loading} variant="outline" className="border-gray-300 text-gray-700">
                    Mở khóa
                  </Button>
                )}
                {status !== "APPROVED" && (
                  <>
                    <Button type="button" onClick={() => handleApprove("APPROVE")} disabled={loading} variant="outline" className="border-[#A14F39] text-[#A14F39]">
                      Phê Duyệt KPI
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-[#A14F39] hover:bg-[#8a3f2d] text-white">
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? "Đang lưu..." : "Lưu Kết Quả"}
                    </Button>
                  </>
                )}
                {status === "APPROVED" && currentUser.role === "ADMIN" && (
                  <Button type="submit" disabled={loading} className="bg-[#A14F39] hover:bg-[#8a3f2d] text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Lưu (Admin)
                  </Button>
                )}
              </div>
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
