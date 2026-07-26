"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { getKpiRating, getKpiRatingColor, calculateKpiScore } from "@/lib/utils";
import { Download, Trash2 } from "lucide-react";

export function KpiDashboard({ user }: { user: any }) {
  const [dateRange, setDateRange] = useState("this_month");
  const [cycleFilter, setCycleFilter] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedEmp, setSelectedEmp] = useState(user.role === "EMPLOYEE" ? user.id : "");
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  const empList = Array.isArray(employees) ? employees : ((employees as any)?.data || (employees as any)?.items || []);
  const deptList = Array.isArray(departments) ? departments : ((departments as any)?.data || (departments as any)?.items || []);

  const currentUserId = user?.id || user?.sub;
  const currentUserFull = empList.find((e: any) => e.id === currentUserId) || user;

  const userRoleStr = (currentUserFull?.role || user?.role || (Array.isArray(user?.roles) ? user.roles[0] : '') || '').toUpperCase();
  const isFullDeptAccess = ["ADMIN", "OWNER", "ACCOUNTANT", "KETOAN"].includes(userRoleStr);
  const managerDeptIds = currentUserFull?.departmentMember?.map((dm: any) => dm.departmentId) || [];

  const visibleDepartments = isFullDeptAccess
    ? deptList
    : deptList.filter((d: any) => managerDeptIds.includes(d.id));

  useEffect(() => {
    if (!isFullDeptAccess && managerDeptIds.length > 0 && visibleDepartments.length > 0 && (!selectedDept || !visibleDepartments.some(d => d.id === selectedDept))) {
      setSelectedDept(visibleDepartments[0].id);
    }
  }, [isFullDeptAccess, managerDeptIds, visibleDepartments, selectedDept]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      if (user.role !== "EMPLOYEE") {
        const [deptRes, empRes] = await Promise.all([
          fetch("/api/departments?limit=1000"),
          fetch("/api/organization/employees?limit=1000")
        ]);
        if (deptRes.ok) {
          const dData = await deptRes.json();
          setDepartments(Array.isArray(dData) ? dData : (dData?.data || dData?.items || []));
        }
        if (empRes.ok) {
          const eData = await empRes.json();
          setEmployees(Array.isArray(eData) ? eData : (eData?.data || eData?.items || []));
        }
      }
    };
    fetchDropdowns();
  }, [user.role]);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const url = new URL("/api/kpi/records", window.location.origin);
        if (selectedEmp) url.searchParams.append("userId", selectedEmp);
        
        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          setRecords(data);
        }
      } catch (error) {
        console.error("Failed to fetch KPI records", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [selectedEmp]);

  const filteredRecordsByDate = records.filter(r => {
    const d = new Date(r.periodStart);
    const now = new Date();
    
    if (dateRange === "this_month") {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (dateRange === "last_month") {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
    }
    if (dateRange === "this_week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return d >= startOfWeek;
    }
    if (dateRange === "last_week") {
      const startOfLastWeek = new Date(now);
      startOfLastWeek.setDate(now.getDate() - now.getDay() - 7);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
      return d >= startOfLastWeek && d <= endOfLastWeek;
    }
    if (dateRange === "this_quarter") {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const rQuarter = Math.floor(d.getMonth() / 3);
      return currentQuarter === rQuarter && now.getFullYear() === d.getFullYear();
    }
    return true;
  });

  const filteredRecords = cycleFilter === "ALL" 
    ? filteredRecordsByDate 
    : filteredRecordsByDate.filter(r => r.criteria?.evaluationCycle === cycleFilter);

  const totalScore = filteredRecords.reduce((acc, r) => acc + r.score, 0);
  const maxScore = filteredRecords.reduce((acc, r) => acc + (r.criteria?.weightPercent || 10), 0);
  const avgScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const rating = getKpiRating(avgScore);
  const ratingColor = getKpiRatingColor(avgScore);

  const passedCount = filteredRecords.filter(r => {
    const act = r.actualValue ?? r.actual ?? 0;
    const crit = r.criteria || {};
    const score = r.score ?? calculateKpiScore(act, crit.targetValue || 0, crit.weightPercent || 0, crit.comparisonType, crit.unit);
    return score >= (crit.weightPercent || 0);
  }).length;
  const failedCount = filteredRecords.length - passedCount;

  const handleExport = (format: string) => {
    window.location.href = `/api/kpi/export?format=${format}`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;
    
    try {
      const res = await fetch(`/api/kpi/records?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setRecords(records.filter(r => r.id !== id));
      } else {
        alert("Có lỗi xảy ra khi xóa");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi hệ thống");
    }
  };

  if (loading) {
    return <div className="p-8 text-center dafa-muted">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {user.role !== "EMPLOYEE" && (
            <>
              <select 
                className="border dafa-border rounded-md px-3 py-2 text-sm bg-white"
                value={selectedDept}
                onChange={(e) => { setSelectedDept(e.target.value); setSelectedEmp(""); }}
              >
                {isFullDeptAccess && <option value="">Tất cả phòng ban</option>}
                {visibleDepartments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <select 
                className="border dafa-border rounded-md px-3 py-2 text-sm bg-white"
                value={selectedEmp}
                onChange={(e) => setSelectedEmp(e.target.value)}
              >
                <option value="">Tất cả nhân viên (Gộp chung)</option>
                {empList
                  .filter((emp: any) => {
                    const roleStr = (user?.role || (Array.isArray(user?.roles) ? user.roles[0] : '') || '').toUpperCase();
                    if (roleStr === "MANAGER") {
                      const empDeptIds = emp.departmentMember?.map((dm: any) => dm.departmentId) || [];
                      const isInDept = empDeptIds.some((id: string) => managerDeptIds.includes(id)) || emp.id === user?.id;
                      if (!isInDept) return false;
                    }
                    const deptToFilter = isFullDeptAccess ? selectedDept : (selectedDept || managerDeptIds[0]);
                    return !deptToFilter || emp.departmentMember?.some((dm: any) => dm.departmentId === deptToFilter);
                  })
                  .map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                ))}
              </select>
            </>
          )}

          <select 
            className="border dafa-border rounded-md px-3 py-2 text-sm bg-white"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="this_week">Tuần này</option>
            <option value="last_week">Tuần trước</option>
            <option value="this_month">Tháng này</option>
            <option value="last_month">Tháng trước</option>
            <option value="this_quarter">Quý này</option>
          </select>
          <select 
            className="border dafa-border rounded-md px-3 py-2 text-sm bg-white"
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
          >
            <option value="ALL">Tất cả chu kỳ</option>
            <option value="WEEKLY">Tiêu chí Hàng tuần</option>
            <option value="MONTHLY">Tiêu chí Hàng tháng</option>
            <option value="QUARTERLY">Tiêu chí Hàng quý</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          {(user.role === "ADMIN" || user.role === "ACCOUNTANT" || user.role === "KETOAN") && (
            <Button variant="primary" size="sm" onClick={() => handleExport("payroll")} className="bg-[#A14F39] hover:bg-[#8a3f2d] text-white">
              <Download className="w-4 h-4 mr-2" />
              Xuất Kết Quả Lương (Excel)
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col gap-2 shadow-sm">
          <h3 className="text-sm dafa-muted font-medium uppercase">Điểm KPI Trung Bình</h3>
          <p className="text-3xl font-bold dafa-text">{avgScore.toFixed(1)}%</p>
        </Card>
        <Card className="p-4 flex flex-col gap-2 shadow-sm">
          <h3 className="text-sm dafa-muted font-medium uppercase">Xếp Loại</h3>
          <div>
            <Badge style={{ backgroundColor: ratingColor, color: "#fff" }} className="text-sm py-1">
              {rating}
            </Badge>
          </div>
        </Card>
        <Card className="p-4 flex flex-col gap-2 shadow-sm">
          <h3 className="text-sm dafa-muted font-medium uppercase">Tiêu chí Đạt</h3>
          <p className="text-3xl font-bold text-green-600">{passedCount}</p>
        </Card>
        <Card className="p-4 flex flex-col gap-2 shadow-sm">
          <h3 className="text-sm dafa-muted font-medium uppercase">Tiêu chí Chưa đạt</h3>
          <p className="text-3xl font-bold text-red-600">{failedCount}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4 h-[400px]">
          <h3 className="text-lg font-bold mb-4 dafa-text">Điểm số theo tiêu chí</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredRecords}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="criteria.name" tick={{ fontSize: 12 }} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="score" name="Điểm đạt được" fill="#A14F39" radius={[4, 4, 0, 0]} />
              <Bar dataKey="criteria.weightPercent" name="Trọng số (Max)" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 h-[400px]">
          <h3 className="text-lg font-bold mb-4 dafa-text">Đánh giá đa chiều</h3>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={filteredRecords}>
              <PolarGrid />
              <PolarAngleAxis dataKey="criteria.name" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis />
              <Radar name="Tỷ lệ hoàn thành (%)" dataKey={(r) => {
                const act = r.actualValue ?? r.actual ?? 0;
                const tgt = r.criteria?.targetValue ?? r.criteria?.target ?? 1;
                return (act / (tgt || 1)) * 100;
              }} stroke="#A14F39" fill="#A14F39" fillOpacity={0.5} />
              <RechartsTooltip />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dafa-muted border-b dafa-border text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Tiêu chí</th>
                <th className="px-6 py-3">Nhân viên</th>
                <th className="px-6 py-3">Đơn vị</th>
                <th className="px-6 py-3 text-right">Mục tiêu</th>
                <th className="px-6 py-3 text-right">Thực tế</th>
                <th className="px-6 py-3 text-right">Trọng số</th>
                <th className="px-6 py-3 text-right">Điểm</th>
                {user.role !== "EMPLOYEE" && <th className="px-6 py-3 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => {
                const act = r.actualValue ?? r.actual ?? 0;
                const tgt = r.criteria?.targetValue ?? r.criteria?.target ?? 0;
                const weight = r.criteria?.weightPercent ?? r.criteria?.weight ?? 0;
                const userName = r.user?.fullName || employees.find(e => e.id === r.userId)?.fullName || 'N/A';
                const deptName = r.criteria?.department?.name || 'Tất cả';

                return (
                  <tr key={r.id} className="border-b dafa-border bg-white hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium dafa-text">{r.criteria?.name || 'N/A'}</td>
                    <td className="px-6 py-4 dafa-text">
                      <span className="font-semibold">{userName}</span>
                      <span className="text-xs dafa-muted block">{deptName}</span>
                    </td>
                    <td className="px-6 py-4 dafa-muted">{r.criteria?.unit || '-'}</td>
                    <td className="px-6 py-4 text-right font-medium">{tgt}</td>
                    <td className="px-6 py-4 text-right font-bold text-blue-600">{act}</td>
                    <td className="px-6 py-4 text-right">{weight}</td>
                    <td className="px-6 py-4 text-right font-bold text-[#A14F39]">{(r.score || 0).toFixed(2)}</td>
                    {user.role !== "EMPLOYEE" && (
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700" title="Xóa">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center dafa-muted">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
