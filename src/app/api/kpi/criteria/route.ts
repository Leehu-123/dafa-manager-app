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
    const userId = searchParams.get("userId");

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
      include: {
        department: {
          select: { name: true },
        },
        user: {
          select: { fullName: true }
        }
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
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { departmentId, userId, name, description, unit, weightPercent, targetValue, evaluationCycle, comparisonType, isAuto, autoSource, isActive } = body;

    if (!name || !unit || targetValue === undefined || weightPercent === undefined || !evaluationCycle || !departmentId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const criteria = await prisma.kpiCriteria.create({
      data: {
        companyId: session.user.companyId,
        departmentId,
        userId: userId || null,
        name,
        description: description || null,
        unit,
        weightPercent: Number(weightPercent),
        targetValue: Number(targetValue),
        evaluationCycle,
        comparisonType: comparisonType || "HIGHER_BETTER",
        isAuto: isAuto ?? false,
        autoSource: autoSource || null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(criteria);
  } catch (error) {
    console.error("[KPI_CRITERIA_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
