import { auth } from "@/lib/auth";
import { fetchFromCoreAPI } from '@/lib/api';
import { redirect } from "next/navigation";
import { PrintLayout } from "./PrintLayout";

export const metadata = {
  title: "In Biên Bản KPI",
};

export default async function PrintKpiPage({
  searchParams,
}: {
  searchParams: Promise<{ userId: string; periodStart?: string; periodEnd?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { userId, periodStart, periodEnd } = await searchParams;

  if (!userId) {
    return <div className="p-8 text-center text-red-500 font-medium">Vui lòng chọn nhân viên để in biên bản KPI.</div>;
  }

  const res = await fetchFromCoreAPI('/users/' + userId);
  const targetUser = res?.data || res;

  if (!targetUser) {
    return <div className="p-8 text-center text-red-500 font-medium">Không tìm thấy nhân viên</div>;
  }

  const departmentId = targetUser.departmentMember?.[0]?.departmentId;
  const departmentName = targetUser.departmentMember?.[0]?.department?.name || "N/A";

  const criteriaRes = await fetchFromCoreAPI('/kpi-criteria' + (departmentId ? `?departmentId=${departmentId}` : ''));
  const criteriaData = criteriaRes?.data || criteriaRes || [];

  let periodText = "";
  if (periodStart && periodEnd) {
    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      periodText = `Từ ${start.toLocaleDateString("vi-VN")} đến ${end.toLocaleDateString("vi-VN")}`;
    }
  }
  
  if (!periodText) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    periodText = `Tháng ${month}/${year}`;
  }

  return (
    <PrintLayout 
      user={targetUser} 
      departmentName={departmentName} 
      criteria={Array.isArray(criteriaData) ? criteriaData : []} 
      periodText={periodText} 
    />
  );
}
