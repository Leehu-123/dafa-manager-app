import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, unit, target, weight, cycle, departmentId, isActive } = body;

    const criteria = await prisma.kpiCriteria.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(unit && { unit }),
        ...(target !== undefined && { target: Number(target) }),
        ...(weight !== undefined && { weight: Number(weight) }),
        ...(cycle && { cycle }),
        ...(departmentId && { departmentId }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(criteria);
  } catch (error) {
    console.error("[KPI_CRITERIA_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const criteria = await prisma.kpiCriteria.delete({
      where: { id },
    });

    return NextResponse.json(criteria);
  } catch (error) {
    console.error("[KPI_CRITERIA_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
