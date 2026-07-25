import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PrintLayout } from "./PrintLayout";

export const metadata = {
  title: "In Biên Bản KPI",
};

export default async function PrintKpiPage({
  searchParams,
}: {
  searchParams: Promise<{ userId: string; periodStart: string; periodEnd: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { userId, periodStart, periodEnd } = await searchParams;

  if (!userId || !periodStart || !periodEnd) {
    return <div className="p-8 text-center text-red-500">Thiếu tham số (userId, periodStart, periodEnd)</div>;
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId, companyId: session.user.companyId },
    include: {
      departmentMember: {
        include: { department: true }
      }
    }
  });

  if (!targetUser) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy nhân viên</div>;
  }

  // Fetch criteria
  const departmentId = targetUser.departmentMember?.[0]?.departmentId;
  
  let whereClause: any = { companyId: session.user.companyId };
  if (departmentId && userId) {
    whereClause.OR = [
      { departmentId, userId },
      { departmentId, userId: null }
    ];
  } else if (departmentId) {
    whereClause.departmentId = departmentId;
  } else if (userId) {
    whereClause.userId = userId;
  }

  const criteria = await prisma.kpiCriteria.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  const departmentName = targetUser.departmentMember?.[0]?.department?.name || "N/A";
  
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  const periodText = `Từ ${start.toLocaleDateString("vi-VN")} đến ${end.toLocaleDateString("vi-VN")}`;

  return (
    <PrintLayout 
      user={targetUser} 
      departmentName={departmentName} 
      criteria={criteria} 
      periodText={periodText} 
    />
  );
}
