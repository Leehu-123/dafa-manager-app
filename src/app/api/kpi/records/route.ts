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
    const userId = searchParams.get("userId");
    const criteriaId = searchParams.get("criteriaId");
    const periodStart = searchParams.get("periodStart");
    const periodEnd = searchParams.get("periodEnd");

    let whereClause: any = {};
    if (userId) whereClause.userId = userId;
    if (criteriaId) whereClause.criteriaId = criteriaId;
    
    if (periodStart || periodEnd) {
      whereClause.periodStart = {};
      whereClause.periodEnd = {};
      if (periodStart) whereClause.periodStart.gte = new Date(periodStart);
      if (periodEnd) whereClause.periodEnd.lte = new Date(periodEnd);
    }

    if (session.user.role === "EMPLOYEE") {
      whereClause.userId = session.user.id;
    }

    const records = await prisma.kpiRecord.findMany({
      where: whereClause,
      include: {
        criteria: { select: { name: true, targetValue: true, weightPercent: true, unit: true } },
        user: { select: { fullName: true } },
      },
      orderBy: { periodStart: "desc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("[KPI_RECORDS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role === "EMPLOYEE") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { userId, criteriaId, periodStart, periodEnd, actualValue, actual, notes, note } = body;
    
    const finalActual = actualValue ?? actual;
    const finalNotes = notes ?? note;

    if (!userId || !criteriaId || !periodStart || !periodEnd || finalActual === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const criteria = await prisma.kpiCriteria.findUnique({ where: { id: criteriaId } });
    if (!criteria) {
      return new NextResponse("Criteria not found", { status: 404 });
    }

    const score = (Number(finalActual) / criteria.targetValue) * criteria.weightPercent;

    const existingRecord = await prisma.kpiRecord.findFirst({
      where: {
        userId,
        criteriaId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
      }
    });

    let record;
    if (existingRecord) {
      record = await prisma.kpiRecord.update({
        where: { id: existingRecord.id },
        data: {
          actualValue: Number(finalActual),
          score,
          notes: finalNotes,
        }
      });
    } else {
      record = await prisma.kpiRecord.create({
        data: {
          userId,
          criteriaId,
          periodStart: new Date(periodStart),
          periodEnd: new Date(periodEnd),
          actualValue: Number(finalActual),
          score,
          notes: finalNotes,
        }
      });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("[KPI_RECORDS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
