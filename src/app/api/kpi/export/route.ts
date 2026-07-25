import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format");
    const userId = searchParams.get("userId");
    const departmentId = searchParams.get("departmentId");
    const periodStart = searchParams.get("periodStart");
    const periodEnd = searchParams.get("periodEnd");

    let whereClause: any = { companyId: session.user.companyId };
    if (userId) whereClause.userId = userId;
    if (departmentId) whereClause.user = { departmentMember: { some: { departmentId } } };
    
    // Default to only approved records for payroll purposes, unless specified otherwise
    const onlyApproved = searchParams.get("onlyApproved") !== "false";
    if (onlyApproved) {
      whereClause.status = "APPROVED";
    }

    if (periodStart || periodEnd) {
      whereClause.periodStart = {};
      whereClause.periodEnd = {};
      if (periodStart) whereClause.periodStart.gte = new Date(periodStart);
      if (periodEnd) whereClause.periodEnd.lte = new Date(periodEnd);
    }

    const records = await prisma.kpiRecord.findMany({
      where: whereClause,
      include: {
        criteria: {
          select: { name: true, unit: true, targetValue: true, weightPercent: true, department: { select: { name: true } } }
        },
        user: { select: { fullName: true, departmentMember: { include: { department: { select: { name: true } } } } } },
      },
      orderBy: [{ user: { fullName: "asc" } }],
    });

    // Generate Payroll Summary
    const userTotals: Record<string, { user: any; totalScore: number }> = {};

    records.forEach(r => {
      if (!userTotals[r.userId]) {
        userTotals[r.userId] = { user: r.user, totalScore: 0 };
      }
      userTotals[r.userId].totalScore += r.score;
    });

    const payrollData = Object.values(userTotals).map(u => ({
      "Nhân viên": u.user.fullName || "N/A",
      "Phòng ban": u.user.departmentMember?.[0]?.department?.name || "N/A",
      "Tổng điểm KPI": Number(u.totalScore.toFixed(2)),
      "Trạng thái": "Đã duyệt",
    }));

    const ws = XLSX.utils.json_to_sheet(payrollData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll_KPI");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="KPI_Payroll_Report.xlsx"',
      },
    });
  } catch (error: any) {
    console.error("[KPI_EXPORT]", error);
    return new NextResponse("Internal Error: " + error.message, { status: 500 });
  }
}
