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

    let whereClause: any = { companyId: session.user.companyId };
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
    } else if (session.user.role === "MANAGER") {
      const managerDepts = await prisma.departmentMember.findMany({
        where: { userId: session.user.id },
        select: { departmentId: true }
      });
      const deptIds = managerDepts.map(d => d.departmentId);
      if (deptIds.length > 0) {
        whereClause.user = {
          departmentMember: {
            some: { departmentId: { in: deptIds } }
          }
        };
      } else {
        whereClause.userId = session.user.id; // Fallback if no department
      }
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

    const criteria = await prisma.kpiCriteria.findUnique({ where: { id: criteriaId, companyId: session.user.companyId } });
    if (!criteria) {
      return new NextResponse("Criteria not found", { status: 404 });
    }

    const actualNum = Number(finalActual);
    let score = 0;
    
    if (criteria.comparisonType === "LOWER_BETTER") {
      if (criteria.targetValue === 0) {
        score = actualNum <= 0 ? criteria.weightPercent : 0;
      } else {
        const ratio = actualNum / criteria.targetValue;
        score = (2 - ratio) * criteria.weightPercent;
      }
    } else {
      score = (actualNum / criteria.targetValue) * criteria.weightPercent;
    }

    // Cap at weightPercent (no over-achievement bonus points according to plan)
    score = Math.max(0, Math.min(score, criteria.weightPercent));

    const existingRecord = await prisma.kpiRecord.findFirst({
      where: {
        companyId: session.user.companyId,
        userId,
        criteriaId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
      }
    });

    let record;
    if (existingRecord) {
      if (existingRecord.status === 'APPROVED' && session.user.role !== 'ADMIN') {
        return new NextResponse("Record is approved and locked", { status: 403 });
      }
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
          companyId: session.user.companyId,
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

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role === "EMPLOYEE") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return new NextResponse("Missing record ID", { status: 400 });

    const existingRecord = await prisma.kpiRecord.findUnique({ where: { id } });
    if (!existingRecord) return new NextResponse("Not found", { status: 404 });
    if (existingRecord.status === 'APPROVED' && session.user.role !== 'ADMIN') {
      return new NextResponse("Record is approved and locked", { status: 403 });
    }

    await prisma.kpiRecord.delete({
      where: {
        id,
      }
    });

    return new NextResponse("Deleted successfully", { status: 200 });
  } catch (error) {
    console.error("[KPI_RECORDS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
