"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { getKpiRating, getKpiRatingColor } from "@/lib/utils";
import { Download } from "lucide-react";

export function KpiDashboard({ user }: { user: any }) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/kpi/records");
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
  }, []);

  const totalScore = records.reduce((acc, r) => acc + r.score, 0);
  const maxScore = records.reduce((acc, r) => acc + r.criteria.weight, 0);
  const avgScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const rating = getKpiRating(avgScore);
  const ratingColor = getKpiRatingColor(avgScore);
  
  const passedCount = records.filter(r => (r.actual / r.criteria.target) >= 1).length;
  const failedCount = records.length - passedCount;

  const handleExport = (format: string) => {
    window.location.href = `/api/kpi/export?format=${format}`;
  };

  if (loading) {
    return <div className="p-8 text-center dafa-muted">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <select 
          className="border dafa-border rounded-md px-3 py-2 text-sm dafa-text bg-white"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="month">Tháng này</option>
          <option value="quarter">Quý này</option>
        </select>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("xlsx")}>
            <Download className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
            <Download className="w-4 h-4 mr-2" />
            Xuất PDF
          </Button>
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
            <BarChart data={records}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="criteria.name" tick={{ fontSize: 12 }} />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="score" name="Điểm đạt được" fill="#A14F39" radius={[4, 4, 0, 0]} />
              <Bar dataKey="criteria.weight" name="Trọng số (Max)" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 h-[400px]">
          <h3 className="text-lg font-bold mb-4 dafa-text">Đánh giá đa chiều</h3>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={records}>
              <PolarGrid />
              <PolarAngleAxis dataKey="criteria.name" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis />
              <Radar name="Tỷ lệ hoàn thành (%)" dataKey={(r) => (r.actual / r.criteria.target) * 100} stroke="#A14F39" fill="#A14F39" fillOpacity={0.5} />
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
                <th className="px-6 py-3">Đơn vị</th>
                <th className="px-6 py-3 text-right">Mục tiêu</th>
                <th className="px-6 py-3 text-right">Thực tế</th>
                <th className="px-6 py-3 text-right">Trọng số</th>
                <th className="px-6 py-3 text-right">Điểm</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b dafa-border bg-white hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium dafa-text">{record.criteria.name}</td>
                  <td className="px-6 py-4 dafa-muted">{record.criteria.unit}</td>
                  <td className="px-6 py-4 text-right font-medium">{record.criteria.target}</td>
                  <td className="px-6 py-4 text-right font-bold text-blue-600">{record.actual}</td>
                  <td className="px-6 py-4 text-right">{record.criteria.weight}</td>
                  <td className="px-6 py-4 text-right font-bold text-[#A14F39]">{record.score.toFixed(2)}</td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center dafa-muted">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
