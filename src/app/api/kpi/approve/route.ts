import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    // Only ADMIN or MANAGER can approve. ACCOUNTANT can also approve if they rated it, but typically Manager approves.
    // For now, allow ADMIN, MANAGER, ACCOUNTANT (since role is ACCOUNTANT or MANAGER).
    if (!session?.user || session.user.role === "EMPLOYEE") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { userId, periodStart, periodEnd, action } = body; 
    // action: "APPROVE" or "UNLOCK"

    if (!userId || !periodStart || !periodEnd || !action) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (action === "UNLOCK" && session.user.role !== "ADMIN") {
      return new NextResponse("Only ADMIN can unlock approved KPIs", { status: 403 });
    }

    const newStatus = action === "APPROVE" ? "APPROVED" : "DRAFT";

    // Update all records for this user in this period
    const result = await prisma.kpiRecord.updateMany({
      where: {
        companyId: session.user.companyId,
        userId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
      },
      data: {
        status: newStatus,
      }
    });

    return NextResponse.json({ success: true, count: result.count, newStatus });
  } catch (error) {
    console.error("[KPI_APPROVE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
