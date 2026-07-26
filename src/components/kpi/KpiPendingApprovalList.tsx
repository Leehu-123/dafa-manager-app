"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { CheckCircle, Unlock, Eye, Search, Calendar, FileCheck, RefreshCw, Trash2 } from "lucide-react";
import { formatDate, getInitials, getKpiRating, getKpiRatingColor } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function KpiPendingApprovalList({ currentUser }: { currentUser: any }) {
  const router = useRouter();
  const [sheets, setSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingKey, setProcessingKey] = useState<string | null>(null);

  const userRoleStr = (currentUser?.role || (Array.isArray(currentUser?.roles) ? currentUser.roles[0] : "") || "").toUpperCase();
  const isAdmin = ["ADMIN", "OWNER"].includes(userRoleStr);
  const isFullDeptAccess = ["ADMIN", "OWNER", "ACCOUNTANT"].includes(userRoleStr);
  const managerDeptIds = currentUser?.departmentMember?.map((dm: any) => dm.departmentId) || [];

  const visibleDepartments = isFullDeptAccess
    ? departments
    : departments.filter((d) => managerDeptIds.includes(d.id));

  useEffect(() => {
    if (!isFullDeptAccess && managerDeptIds.length > 0 && visibleDepartments.length > 0 && (!selectedDept || !visibleDepartments.some(d => d.id === selectedDept))) {
      setSelectedDept(visibleDepartments[0].id);
    }
  }, [isFullDeptAccess, managerDeptIds, visibleDepartments, selectedDept]);

  const fetchSheets = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/kpi/pending", window.location.origin);
      const activeDept = isFullDeptAccess ? selectedDept : (selectedDept || managerDeptIds[0] || "");
      if (activeDept) url.searchParams.append("departmentId", activeDept);
      if (statusFilter !== "ALL") url.searchParams.append("status", statusFilter);
      if (searchTerm) url.searchParams.append("search", searchTerm);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setSheets(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to fetch pending KPI sheets", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/departments")
      .then((r) => r.json())
      .then((data) => setDepartments(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchSheets();
  }, [selectedDept, statusFilter]);

  const handleApprove = async (sheet: any, action: "APPROVE" | "UNLOCK") => {
    if (!isAdmin) return alert("Chỉ tài khoản quản trị mới có quyền phê duyệt phiếu KPI");
    setProcessingKey(sheet.key);
    try {
      const res = await fetch("/api/kpi/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: sheet.userId,
          periodStart: sheet.periodStart,
          periodEnd: sheet.periodEnd,
          action,
        }),
      });

      if (res.ok) {
        await fetchSheets();
      } else {
        alert("Lỗi khi xử lý phê duyệt phiếu KPI");
      }
    } catch (e) {
      console.error(e);
      alert("Có lỗi xảy ra trong quá trình xử lý");
    } finally {
      setProcessingKey(null);
    }
  };

  const handleDeleteSheet = async (sheet: any) => {
    const confirmMsg = `Bạn có chắc chắn muốn xóa toàn bộ phiếu KPI của "${sheet.user?.fullName}" cho kỳ ${formatDate(sheet.periodStart)} - ${formatDate(sheet.periodEnd)} không?\n\nHành động này không thể hoàn tác.`;
    if (!window.confirm(confirmMsg)) return;

    setProcessingKey(sheet.key);
    try {
      const res = await fetch("/api/kpi/delete-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: sheet.userId,
          periodStart: sheet.periodStart,
          periodEnd: sheet.periodEnd,
        }),
      });

      if (res.ok) {
        await fetchSheets();
      } else {
        alert("Có lỗi xảy ra khi xóa phiếu KPI");
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi kết nối máy chủ");
    } finally {
      setProcessingKey(null);
    }
  };

  const filteredSheets = sheets.filter((s) => {
    if (searchTerm) {
      const name = s.user?.fullName?.toLowerCase() || "";
      return name.includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Bộ lọc & Tìm kiếm */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm theo tên nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#A14F39]/20"
          >
            {isFullDeptAccess && <option value="">Tất cả phòng ban</option>}
            {visibleDepartments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#A14F39]/20"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="DRAFT">Chờ phê duyệt (Đang chấm)</option>
            <option value="APPROVED">Đã phê duyệt</option>
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchSheets}
          disabled={loading}
          className="text-gray-600 border-gray-300 hover:bg-gray-50"
        >
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* Danh sách các phiếu KPI */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
          Đang tải danh sách phiếu KPI cần phê duyệt...
        </div>
      ) : filteredSheets.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200 shadow-sm space-y-3">
          <FileCheck className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-600 font-medium text-base">Hiện không có phiếu KPI nào cần phê duyệt.</p>
          <p className="text-xs text-gray-400">Khi bộ phận nhân sự/kế toán lưu điểm KPI của nhân viên, phiếu sẽ xuất hiện tại đây.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSheets.map((s) => {
            const avgScore = s.maxScore > 0 ? (s.totalScore / s.maxScore) * 100 : 0;
            const rating = getKpiRating(avgScore);
            const isApproved = s.status === "APPROVED";
            const deptName = s.user?.departmentMember?.[0]?.department?.name || "Chưa phân phòng";
            const isProcessing = processingKey === s.key;

            return (
              <Card
                key={s.key}
                className={`p-5 flex flex-col justify-between shadow-sm border transition-all duration-200 ${
                  isApproved ? "border-green-200 bg-green-50/20" : "border-amber-200/80 bg-white hover:border-[#A14F39]/40"
                }`}
              >
                <div>
                  {/* Header thẻ nhân viên */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={s.user?.avatar} fallback={getInitials(s.user?.fullName)} className="w-11 h-11 border border-gray-100 shadow-xs" />
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">{s.user?.fullName}</h4>
                        <p className="text-xs text-gray-500 font-medium">
                          {deptName} • {s.user?.jobTitle || "Nhân viên"}
                        </p>
                      </div>
                    </div>

                    <Badge
                      className={
                        isApproved
                          ? "bg-green-100 text-green-800 border-green-300 font-semibold px-2.5 py-1 text-xs"
                          : "bg-amber-100 text-amber-800 border-amber-300 font-semibold px-2.5 py-1 text-xs"
                      }
                    >
                      {isApproved ? "✓ Đã Phê Duyệt" : "⏳ Chờ Phê Duyệt"}
                    </Badge>
                  </div>

                  {/* Thông tin kỳ & điểm số */}
                  <div className="bg-gray-50/80 p-3.5 rounded-lg border border-gray-100 mb-4 space-y-2.5 text-sm">
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#A14F39]" />
                        Kỳ đánh giá:
                      </span>
                      <span className="font-semibold text-gray-800">
                        {formatDate(s.periodStart)} - {formatDate(s.periodEnd)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-200/60 pt-2.5">
                      <span className="text-xs text-gray-500 font-medium">Tổng điểm KPI ({s.criteriaCount} tiêu chí):</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-extrabold text-[#A14F39]">
                          {s.totalScore.toFixed(2)} / {s.maxScore}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            avgScore >= 100
                              ? "bg-emerald-100 text-emerald-800"
                              : avgScore >= 80
                              ? "bg-blue-100 text-blue-800"
                              : avgScore >= 50
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Các nút thao tác */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/kpi/entry?userId=${s.userId}&periodStart=${s.periodStart}&periodEnd=${s.periodEnd}`
                      )
                    }
                    className="text-gray-700 border-gray-300 hover:bg-gray-50 text-xs py-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Xem & Chấm chi tiết
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleDeleteSheet(s)}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-xs py-1.5"
                    title="Xóa phiếu KPI này"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Xóa Phiếu
                  </Button>

                  {!isApproved ? (
                    isAdmin && (
                      <Button
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handleApprove(s, "APPROVE")}
                        className="bg-[#A14F39] hover:bg-[#8a3f2d] text-white text-xs font-semibold py-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        {isProcessing ? "Đang xử lý..." : "Phê Duyệt Ngay"}
                      </Button>
                    )
                  ) : (
                    isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handleApprove(s, "UNLOCK")}
                        className="border-gray-300 text-gray-600 hover:bg-gray-50 text-xs py-1.5"
                      >
                        <Unlock className="w-3.5 h-3.5 mr-1" />
                        {isProcessing ? "Đang xử lý..." : "Mở khóa"}
                      </Button>
                    )
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
