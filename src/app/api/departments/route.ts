import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whereClause: any = {};
    if (session.user.role === "MANAGER") {
      const managerDepts = await prisma.departmentMember.findMany({
        where: { userId: session.user.id },
        select: { departmentId: true }
      });
      whereClause.id = { in: managerDepts.map(d => d.departmentId) };
    }

    const departments = await prisma.department.findMany({
      where: whereClause,
      include: {
        branch: {
          select: { name: true }
        }
      },
      orderBy: { name: "asc" },
    });

    const sortOrders: any = await prisma.$queryRawUnsafe(`SELECT id, sort_order FROM "Department"`);
    const sortOrderMap = new Map(sortOrders.map((s: any) => [s.id, s.sort_order]));

    const formatted = departments.map((d: any) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      branchId: d.branchId,
      branchName: d.branch?.name || "",
      sortOrder: sortOrderMap.get(d.id) || 0
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("GET Departments Error:", error);
    require('fs').appendFileSync('error_dept.log', `[DEPT_GET] ${error?.message || error}\n`);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, code, branchId, description } = body;

    if (!name || !code || !branchId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const department = await prisma.department.create({
      data: {
        name,
        code,
        branchId,
        description
      }
    });

    return NextResponse.json(department);
  } catch (error) {
    console.error("POST Department Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
