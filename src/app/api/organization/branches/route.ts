import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const branches = await prisma.branch.findMany({
      where: { companyId: session.user.companyId },
      include: {
        departments: {
          select: { id: true, name: true }
        }
      },
      orderBy: { name: "asc" }
    });

    const sortOrders: any = await prisma.$queryRawUnsafe(`SELECT id, sort_order FROM "Branch" WHERE "company_id" = $1::uuid`, session.user.companyId);
    const sortOrderMap = new Map(sortOrders.map((s: any) => [s.id, s.sort_order]));

    const formattedBranches = branches.map(branch => ({
      ...branch,
      sortOrder: sortOrderMap.get(branch.id) || 0
    }));

    return NextResponse.json(formattedBranches);
  } catch (error: any) {
    console.error("[BRANCHES_GET]", error);
    require('fs').appendFileSync('error_branch.log', `[BRANCHES_GET] ${error?.message || error}\n`);
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
    const { name, code, address, city, isActive } = body;

    if (!name || !code || !city || !address) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const branch = await prisma.branch.create({
      data: {
        companyId: session.user.companyId,
        name, code, address, city, isActive: isActive ?? true
      }
    });

    return NextResponse.json(branch);
  } catch (error) {
    console.error("[BRANCHES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
