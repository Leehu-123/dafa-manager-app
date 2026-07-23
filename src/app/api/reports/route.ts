import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const departmentId = searchParams.get("departmentId");
    const submittedById = searchParams.get("submittedById");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let whereClause: any = {};
    if (status) whereClause.status = status;
    if (submittedById) whereClause.submittedById = submittedById;
    if (departmentId) whereClause.departmentId = departmentId;
    
    if (startDate || endDate) {
      whereClause.reportDate = {};
      if (startDate) whereClause.reportDate.gte = new Date(startDate);
      if (endDate) whereClause.reportDate.lte = new Date(endDate);
    }

    if (session.user.role === "EMPLOYEE") {
      whereClause.submittedById = session.user.id;
    }

    const reports = await prisma.workReport.findMany({
      where: whereClause,
      include: {
        template: { select: { name: true, frequency: true } },
        submittedBy: { select: { fullName: true } },
        reviewedBy: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("[REPORTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { templateId, departmentId, reportDate, reportData, data, status } = body;
    
    const finalReportData = reportData || data;

    if (!templateId || !reportDate || !finalReportData) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    
    let resolvedDepartmentId = departmentId;
    if (!resolvedDepartmentId) {
      const template = await prisma.reportTemplate.findUnique({ where: { id: templateId } });
      if (template) {
        resolvedDepartmentId = template.departmentId;
      }
    }

    const report = await prisma.workReport.create({
      data: {
        templateId,
        departmentId: resolvedDepartmentId || "default-dept", // Ensure your schema accepts this or it's resolved properly
        submittedById: session.user.id,
        reportDate: new Date(reportDate),
        reportData: finalReportData,
        status: status || "DRAFT",
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("[REPORTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
