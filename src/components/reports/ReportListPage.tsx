"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FileText, Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export function ReportListPage({ currentUser }: { currentUser: any }) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(currentUser.role === "EMPLOYEE" ? "my_reports" : "pending");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        let url = "/api/reports";
        if (currentUser.role !== "EMPLOYEE" && activeTab === "pending") {
          url += "?status=SUBMITTED";
        }
        if (statusFilter) {
          url += (url.includes("?") ? "&" : "?") + `status=${statusFilter}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          setReports(await res.json());
        }
      } catch (error) {
        console.error("Error fetching reports", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [activeTab, statusFilter, currentUser]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "DRAFT": return <Badge variant="secondary">Nháp</Badge>;
      case "SUBMITTED": return <Badge className="bg-blue-100 text-blue-800">Chờ duyệt</Badge>;
      case "APPROVED": return <Badge className="bg-green-100 text-green-800">Đã duyệt</Badge>;
      case "REJECTED": return <Badge className="bg-red-100 text-red-800">Từ chối</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-2 border-b dafa-border pb-2 w-full md:w-auto">
          {currentUser.role === "EMPLOYEE" ? (
            <>
              <button className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'my_reports' ? 'border-[#A14F39] text-[#A14F39]' : 'border-transparent dafa-muted hover:text-[#A14F39]'}`} onClick={() => setActiveTab('my_reports')}>Báo cáo của tôi</button>
            </>
          ) : (
            <>
              <button className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'pending' ? 'border-[#A14F39] text-[#A14F39]' : 'border-transparent dafa-muted hover:text-[#A14F39]'}`} onClick={() => setActiveTab('pending')}>Chờ duyệt</button>
              <button className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'all' ? 'border-[#A14F39] text-[#A14F39]' : 'border-transparent dafa-muted hover:text-[#A14F39]'}`} onClick={() => setActiveTab('all')}>Tất cả báo cáo</button>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <select className="border dafa-border rounded-md px-3 py-2 text-sm bg-white" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Nháp</option>
            <option value="SUBMITTED">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
          <Link href="/reports/submit">
            <Button className="bg-[#A14F39] hover:bg-[#8a3f2d] text-white">
              <Plus className="w-4 h-4 mr-2" /> Nộp báo cáo
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8 dafa-muted">Đang tải báo cáo...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.length === 0 ? (
            <div className="col-span-full text-center p-12 bg-gray-50 rounded-lg border border-dashed dafa-border dafa-muted">
              Không tìm thấy báo cáo nào
            </div>
          ) : (
            reports.map((report) => (
              <Link href={`/reports/${report.id}`} key={report.id}>
                <Card className="p-4 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-[#A14F39]">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <h3 className="font-bold dafa-text">{report.template.name}</h3>
                      <span className="text-xs dafa-muted">{formatDate(report.reportDate)}</span>
                    </div>
                    {getStatusBadge(report.status)}
                  </div>
                  
                  <div className="flex flex-col gap-1 mt-2 text-sm">
                    <div className="flex justify-between">
                      <span className="dafa-muted">Người nộp:</span>
                      <span className="font-medium dafa-text">{report.submittedBy.name}</span>
                    </div>
                    {report.reviewedBy && (
                      <div className="flex justify-between">
                        <span className="dafa-muted">Người duyệt:</span>
                        <span className="font-medium dafa-text">{report.reviewedBy.name}</span>
                      </div>
                    )}
                  </div>

                  {report.feedback && (
                    <div className="mt-2 text-xs p-2 bg-gray-50 rounded-md border dafa-border italic dafa-muted line-clamp-2">
                      <span className="font-semibold not-italic">Phản hồi: </span>
                      {report.feedback}
                    </div>
                  )}
                </Card>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
