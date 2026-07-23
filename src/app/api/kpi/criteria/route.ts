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

    const criteria = await prisma.kpiCriteria.findMany({
      where: departmentId ? { departmentId } : undefined,
      include: {
        department: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(criteria);
  } catch (error) {
    console.error("[KPI_CRITERIA_GET]", error);
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
    const { name, unit, targetValue, weightPercent, evaluationCycle, departmentId, isActive } = body;

    if (!name || !unit || targetValue === undefined || weightPercent === undefined || !evaluationCycle || !departmentId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const criteria = await prisma.kpiCriteria.create({
      data: {
        name,
        unit,
        targetValue: Number(targetValue),
        weightPercent: Number(weightPercent),
        evaluationCycle,
        departmentId,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(criteria);
  } catch (error) {
    console.error("[KPI_CRITERIA_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
