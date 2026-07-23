"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ReportDetail({ reportId, currentUser }: { reportId: string, currentUser: any }) {
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/reports/${reportId}`);
        if (res.ok) {
          const data = await res.json();
          setReport(data);
          setFeedback(data.feedback || "");
        }
      } catch (error) {
        console.error("Error fetching report", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId]);

  const handleReview = async (status: string) => {
    if (status === "REJECTED" && !feedback.trim()) {
      return alert("Vui lòng nhập phản hồi khi từ chối báo cáo");
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback })
      });
      
      if (res.ok) {
        alert("Đã cập nhật trạng thái báo cáo!");
        router.refresh();
        const data = await res.json();
        setReport(data);
      }
    } catch (error) {
      console.error("Error reviewing report", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center dafa-muted">Đang tải báo cáo...</div>;
  if (!report) return <div className="p-8 text-center text-red-500">Không tìm thấy báo cáo</div>;

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "DRAFT": return <Badge variant="secondary">Nháp</Badge>;
      case "SUBMITTED": return <Badge className="bg-blue-100 text-blue-800">Chờ duyệt</Badge>;
      case "APPROVED": return <Badge className="bg-green-100 text-green-800">Đã duyệt</Badge>;
      case "REJECTED": return <Badge className="bg-red-100 text-red-800">Từ chối</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const isReviewer = currentUser.role !== "EMPLOYEE";
  const canReview = isReviewer && report.status === "SUBMITTED";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-start">
        <Link href="/reports">
          <Button variant="ghost" size="sm" className="dafa-muted">
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-start border-b dafa-border pb-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold dafa-text mb-1">{report.template.name}</h2>
            <div className="flex items-center gap-4 text-sm dafa-muted">
              <span>Ngày báo cáo: <span className="font-medium dafa-text">{formatDate(report.reportDate)}</span></span>
              <span>•</span>
              <span>Người nộp: <span className="font-medium dafa-text">{report.submittedBy.name}</span></span>
            </div>
          </div>
          <div>
            {getStatusBadge(report.status)}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {(report.template.fieldsConfig as any[]).map((field, idx) => {
            const value = report.data[field.key];
            
            return (
              <div key={idx} className="flex flex-col gap-1">
                <span className="text-sm font-semibold dafa-text">{field.label}</span>
                <div className="p-3 bg-gray-50 rounded-md border dafa-border text-sm min-h-[40px] whitespace-pre-wrap">
                  {field.type === 'checklist' ? (
                    value && value.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {value.map((v: string, i: number) => <li key={i}>{v}</li>)}
                      </ul>
                    ) : <span className="dafa-muted italic">Không có lựa chọn nào</span>
                  ) : (
                    value ? value : <span className="dafa-muted italic">Không có dữ liệu</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {(report.status === "APPROVED" || report.status === "REJECTED" || canReview) && (
          <div className="mt-8 border-t dafa-border pt-4">
            <h3 className="font-bold dafa-text mb-2">Phản hồi của người quản lý</h3>
            {canReview ? (
              <div className="flex flex-col gap-3">
                <textarea 
                  className="w-full border dafa-border rounded-md p-3 text-sm min-h-[100px]" 
                  placeholder="Nhập nhận xét, phản hồi (bắt buộc nếu từ chối)..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
                <div className="flex justify-end gap-3">
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" disabled={isSubmitting} onClick={() => handleReview("REJECTED")}>
                    <XCircle className="w-4 h-4 mr-2" /> Từ chối
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting} onClick={() => handleReview("APPROVED")}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Phê duyệt
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#fef8f6] rounded-md border border-[#e8d5d0] text-sm">
                <div className="font-medium dafa-text mb-1">
                  Đánh giá bởi: {report.reviewedBy?.name || "Quản lý"} 
                </div>
                <div className="dafa-text whitespace-pre-wrap">{report.feedback || <span className="italic dafa-muted">Không có phản hồi chi tiết</span>}</div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
