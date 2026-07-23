import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const departments = await prisma.department.findMany({
      include: {
        branch: {
          select: { name: true }
        }
      },
      orderBy: { name: "asc" },
    });

    const formatted = departments.map((d: any) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      branchName: d.branch?.name || "",
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET Departments Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
