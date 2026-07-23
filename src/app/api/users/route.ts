import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");
    
    const where: any = { status: "ACTIVE" }; // Assuming User model has status
    if (departmentId) where.departmentId = departmentId;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
      orderBy: { fullName: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET Users Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
