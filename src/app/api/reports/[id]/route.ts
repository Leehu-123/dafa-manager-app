import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const report = await prisma.workReport.findUnique({
      where: { id },
      include: {
        template: true,
        submittedBy: { select: { fullName: true, role: true } },
        reviewedBy: { select: { fullName: true } },
      },
    });

    if (!report) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (session.user.role === "EMPLOYEE" && report.submittedById !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("[REPORT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { reportData, data, status, managerFeedback, feedback } = body;
    
    const finalData = reportData || data;
    const finalFeedback = managerFeedback || feedback;

    const report = await prisma.workReport.findUnique({ where: { id } });
    if (!report) {
      return new NextResponse("Not Found", { status: 404 });
    }

    let updateData: any = {};
    
    if (session.user.role === "EMPLOYEE") {
      if (report.submittedById !== session.user.id) {
        return new NextResponse("Forbidden", { status: 403 });
      }
      if (report.status === "APPROVED" || report.status === "SUBMITTED") {
        return new NextResponse("Cannot edit submitted/approved report", { status: 400 });
      }
      if (finalData) updateData.reportData = finalData;
      if (status) updateData.status = status;
    } else {
      if (status) updateData.status = status;
      if (finalFeedback !== undefined) updateData.managerFeedback = finalFeedback;
      updateData.reviewedById = session.user.id;
    }

    const updatedReport = await prisma.workReport.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("[REPORT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
