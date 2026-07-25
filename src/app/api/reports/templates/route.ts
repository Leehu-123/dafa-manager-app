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
    const departmentId = searchParams.get("departmentId");

    let whereClause: any = { companyId: session.user.companyId };
    if (departmentId) whereClause.departmentId = departmentId;

    const templates = await prisma.reportTemplate.findMany({
      where: whereClause,
      include: {
        department: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("[REPORT_TEMPLATES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, frequency, fieldsConfig, departmentId, isActive } = body;

    if (!name || !frequency || !fieldsConfig || !departmentId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const template = await prisma.reportTemplate.create({
      data: {
        companyId: session.user.companyId,
        name,
        frequency,
        fieldsConfig,
        departmentId,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("[REPORT_TEMPLATES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
