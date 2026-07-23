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

    let whereClause: any = {};
    if (userId) whereClause.userId = userId;
    if (departmentId) whereClause.user = { departmentMember: { some: { departmentId } } };
    
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
        user: { select: { fullName: true } },
      },
      orderBy: [{ user: { fullName: "asc" } }, { criteria: { name: "asc" } }],
    });

    const data = records.map(r => ({
      "Nhân viên": r.user.fullName || "N/A",
      "Phòng ban": r.criteria.department?.name || "N/A",
      "Tiêu chí": r.criteria.name,
      "Đơn vị": r.criteria.unit,
      "Mục tiêu": r.criteria.targetValue,
      "Thực tế": r.actualValue,
      "Trọng số": r.criteria.weightPercent,
      "Điểm": r.score,
    }));

    if (format === "xlsx") {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "KPI_Report");
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="KPI_Report.xlsx"',
        },
      });
    } else if (format === "pdf") {
      const doc = new jsPDF();
      doc.text("Báo Cáo KPI", 14, 15);
      
      const tableData = data.map(row => [
        row["Nhân viên"], row["Phòng ban"], row["Tiêu chí"], row["Đơn vị"], 
        row["Mục tiêu"]?.toString() || '', row["Thực tế"]?.toString() || '', row["Trọng số"]?.toString() || '', row["Điểm"]?.toString() || ''
      ]);

      (doc as any).autoTable({
        head: [['Nhân viên', 'Phòng ban', 'Tiêu chí', 'Đơn vị', 'Mục tiêu', 'Thực tế', 'Trọng số', 'Điểm']],
        body: tableData,
        startY: 20,
      });

      const buffer = Buffer.from(doc.output("arraybuffer"));
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="KPI_Report.pdf"',
        },
      });
    }

    return new NextResponse("Invalid format", { status: 400 });
  } catch (error) {
    console.error("[KPI_EXPORT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
